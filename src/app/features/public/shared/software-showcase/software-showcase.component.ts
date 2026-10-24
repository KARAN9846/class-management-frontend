import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

interface YouTubePlayer {
  destroy(): void;
  getIframe(): HTMLIFrameElement;
  getPlayerState(): number;
  mute(): void;
  pauseVideo(): void;
  playVideo(): void;
}

interface YouTubePlayerEvent {
  readonly data?: number;
  readonly target: YouTubePlayer;
}

interface YouTubePlayerOptions {
  readonly events: {
    readonly onAutoplayBlocked: () => void;
    readonly onError: () => void;
    readonly onReady: (event: YouTubePlayerEvent) => void;
    readonly onStateChange: (event: YouTubePlayerEvent) => void;
  };
  readonly height: string;
  readonly playerVars: {
    readonly controls: number;
    readonly enablejsapi: number;
    readonly origin: string;
    readonly playsinline: number;
    readonly rel: number;
  };
  readonly videoId: string;
  readonly width: string;
}

interface YouTubeApi {
  readonly Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
  readonly PlayerState: {
    readonly BUFFERING: number;
    readonly CUED: number;
    readonly ENDED: number;
    readonly PAUSED: number;
    readonly PLAYING: number;
  };
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | undefined;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    const resolveApi = (): void => {
      previousReadyHandler?.();

      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error('The YouTube player API did not initialize.'));
      }
    };

    window.onYouTubeIframeAPIReady = resolveApi;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (existingScript) {
      existingScript.addEventListener(
        'error',
        () => reject(new Error('The YouTube player API could not be loaded.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.addEventListener(
      'error',
      () => reject(new Error('The YouTube player API could not be loaded.')),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

@Component({
  selector: 'app-software-showcase',
  standalone: true,
  templateUrl: './software-showcase.component.html',
  styleUrl: './software-showcase.component.scss',
})
export class SoftwareShowcaseComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('showcaseSection', { static: true })
  private sectionRef!: ElementRef<HTMLElement>;

  @ViewChild('playerMount', { static: true })
  private playerMountRef!: ElementRef<HTMLElement>;

  @ViewChild('videoFrame', { static: true })
  private videoFrameRef!: ElementRef<HTMLElement>;

  readonly videoId = input.required<string>();
  readonly youtubeUrl = input.required<string>();
  readonly eyebrow = input('PRODUCT WALKTHROUGH');
  readonly heading = input.required<string>();
  readonly description = input.required<string>();

  readonly titleId = computed(() => `showcase-${this.videoId()}-title`);
  readonly playerTitle = computed(() => `${this.heading()} video walkthrough`);
  readonly isLoading = signal(false);
  readonly isReady = signal(false);
  readonly hasLoadError = signal(false);
  readonly manualPlaybackRequired = signal(false);
  readonly isPlaying = signal(false);
  readonly prefersReducedMotion = signal(false);

  private player?: YouTubePlayer;
  private playerApi?: YouTubeApi;
  private preloadObserver?: IntersectionObserver;
  private visibilityObserver?: IntersectionObserver;
  private destroyed = false;
  private initializationStarted = false;
  private sufficientlyVisible = false;
  private explicitlyPaused = false;
  private observerPausePending = false;
  private playRequestPending = false;
  private playbackCompleted = false;
  private manualPlayPending = false;

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.prefersReducedMotion.set(prefersReducedMotion);

    if (prefersReducedMotion) {
      this.manualPlaybackRequired.set(true);
    }

    if (!('IntersectionObserver' in window)) {
      this.manualPlaybackRequired.set(true);
      return;
    }

    this.preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void this.initializePlayer();
          this.preloadObserver?.disconnect();
          this.preloadObserver = undefined;
        }
      },
      { rootMargin: '320px 0px', threshold: 0 },
    );

    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        this.handleVisibility(entry.intersectionRatio);
      },
      { threshold: [0, 0.15, 0.6, 1] },
    );

    this.preloadObserver.observe(this.sectionRef.nativeElement);
    this.visibilityObserver.observe(this.videoFrameRef.nativeElement);
  }

  async playManually(): Promise<void> {
    this.explicitlyPaused = false;
    this.playbackCompleted = false;
    this.manualPlayPending = true;
    this.manualPlaybackRequired.set(false);

    await this.initializePlayer();
    if (this.isReady()) {
      this.requestPlayback(true);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.preloadObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    this.player?.pauseVideo();
    this.player?.destroy();
    this.player = undefined;
  }

  private async initializePlayer(): Promise<void> {
    if (this.initializationStarted || this.destroyed) {
      return;
    }

    const videoId = this.videoId();
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      this.hasLoadError.set(true);
      return;
    }

    this.initializationStarted = true;
    this.isLoading.set(true);

    try {
      const api = await loadYouTubeApi();
      if (this.destroyed) {
        return;
      }

      this.playerApi = api;
      this.player = new api.Player(this.playerMountRef.nativeElement, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          controls: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => this.handlePlayerReady(event),
          onStateChange: (event) => this.handlePlayerStateChange(event),
          onAutoplayBlocked: () => this.handleAutoplayBlocked(),
          onError: () => this.handlePlayerError(),
        },
      });
    } catch {
      if (!this.destroyed) {
        this.handlePlayerError();
      }
    }
  }

  private handlePlayerReady(event: YouTubePlayerEvent): void {
    if (this.destroyed) {
      return;
    }

    this.player = event.target;
    this.player.mute();

    const iframe = this.player.getIframe();
    iframe.title = this.playerTitle();
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.height = '100%';
    iframe.style.width = '100%';

    this.isLoading.set(false);
    this.isReady.set(true);

    if (this.manualPlayPending) {
      this.requestPlayback(true);
    } else if (this.sufficientlyVisible) {
      this.requestPlayback(false);
    }
  }

  private handleVisibility(intersectionRatio: number): void {
    if (intersectionRatio >= 0.6) {
      this.sufficientlyVisible = true;
      void this.initializePlayer();
      this.requestPlayback(false);
      return;
    }

    if (intersectionRatio < 0.15) {
      this.sufficientlyVisible = false;
      this.pauseForViewportExit();
    }
  }

  private requestPlayback(isManualRequest: boolean): void {
    if (
      !this.player ||
      !this.isReady() ||
      this.playRequestPending ||
      this.playbackCompleted ||
      (!isManualRequest &&
        (this.prefersReducedMotion() || this.explicitlyPaused || this.manualPlaybackRequired()))
    ) {
      return;
    }

    const state = this.player.getPlayerState();
    if (
      state === this.playerApi?.PlayerState.PLAYING ||
      state === this.playerApi?.PlayerState.BUFFERING
    ) {
      return;
    }

    this.player.mute();
    this.playRequestPending = true;
    this.player.playVideo();
  }

  private pauseForViewportExit(): void {
    if (!this.player || !this.playerApi) {
      return;
    }

    const state = this.player.getPlayerState();
    if (
      state !== this.playerApi.PlayerState.PLAYING &&
      state !== this.playerApi.PlayerState.BUFFERING
    ) {
      return;
    }

    this.observerPausePending = true;
    this.playRequestPending = false;
    this.player.pauseVideo();
  }

  private handlePlayerStateChange(event: YouTubePlayerEvent): void {
    if (!this.playerApi) {
      return;
    }

    if (event.data === this.playerApi.PlayerState.PLAYING) {
      this.playRequestPending = false;
      this.manualPlayPending = false;
      this.manualPlaybackRequired.set(false);
      this.isPlaying.set(true);
      return;
    }

    if (event.data === this.playerApi.PlayerState.PAUSED) {
      this.playRequestPending = false;
      this.isPlaying.set(false);

      if (this.observerPausePending) {
        this.observerPausePending = false;

        if (this.sufficientlyVisible) {
          this.requestPlayback(false);
        }
      } else {
        this.explicitlyPaused = true;
      }
      return;
    }

    if (event.data === this.playerApi.PlayerState.ENDED) {
      this.playRequestPending = false;
      this.playbackCompleted = true;
      this.isPlaying.set(false);
    }
  }

  private handleAutoplayBlocked(): void {
    this.playRequestPending = false;
    this.manualPlayPending = false;
    this.manualPlaybackRequired.set(true);
    this.isPlaying.set(false);
  }

  private handlePlayerError(): void {
    this.playRequestPending = false;
    this.manualPlayPending = false;
    this.isLoading.set(false);
    this.hasLoadError.set(true);
    this.manualPlaybackRequired.set(false);
  }
}

import {
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    HostListener,
    ViewChild,
    inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
    Subject,
    of
} from 'rxjs';

import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    finalize,
    map,
    switchMap
} from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentQuickViewComponent } from '../student-quick-view/student-quick-view.component';

import { GlobalSearchService } from '../../../core/services/global-search.service';

import {
    GlobalSearchResult,
    GlobalSearchTeacherQuickView
} from './global-search.models';
import { N } from '@angular/cdk/keycodes';


@Component({
    selector: 'app-global-search',
    standalone: true,
    imports: [
        StudentQuickViewComponent
    ],
    templateUrl: './global-search.component.html',
    styleUrl: './global-search.component.scss'
})
export class GlobalSearchComponent {

    @ViewChild('searchInput')
    private searchInput?: ElementRef<HTMLInputElement>;


    // =========================================================
    // SERVICES
    // =========================================================

    private readonly searchService =
        inject(GlobalSearchService);

    private readonly router =
        inject(Router);

    private readonly destroyRef =
        inject(DestroyRef);

    private readonly cdr =
        inject(ChangeDetectorRef);


    // =========================================================
    // SEARCH STREAM
    // =========================================================

    private readonly searchQuery$ =
        new Subject<string>();


    // =========================================================
    // QUICK VIEW REQUEST IDS
    //
    // Prevents an older request from overwriting a newer
    // teacher/student selection.
    // =========================================================


    private teacherQuickViewRequestId = 0;


    // =========================================================
    // SEARCH STATE
    // =========================================================

    query = '';

    results: GlobalSearchResult[] = [];

    selectedIndex = 0;

    isOpen = false;

    isLoading = false;

    isMac = false;


    // =========================================================
    // STUDENT QUICK VIEW
    // =========================================================



    quickViewResult:
        GlobalSearchResult | null = null;



    // =========================================================
    // TEACHER QUICK VIEW
    // =========================================================

    quickViewTeacher:
        GlobalSearchTeacherQuickView | null = null;

    isTeacherQuickViewLoading = false;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor() {

            this.isMac =
        typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

        this.searchQuery$
            .pipe(

                map(query =>
                    query.trim()
                ),

                debounceTime(250),

                distinctUntilChanged(),

                map(query => {

                    if (!query) {

                        this.results = [];

                        this.selectedIndex = 0;

                        this.isLoading = false;

                    } else {

                        this.isLoading = true;

                    }

                    return query;

                }),

                switchMap(query => {

                    if (!query) {

                        return of(
                            [] as GlobalSearchResult[]
                        );

                    }

                    return this.searchService
                        .searchRecords(query)
                        .pipe(

                            map(recordResults => {

                                const actionResults =
                                    this.searchService
                                        .searchActions(query);

                                const pageResults =
                                    this.searchService
                                        .searchPages(query);

                                return [
                                    ...actionResults,
                                    ...recordResults,
                                    ...pageResults
                                ];

                            }),

                            catchError(error => {

                                console.error(
                                    'Global search failed:',
                                    error
                                );

                                return of([
                                    ...this.searchService
                                        .searchActions(query),

                                    ...this.searchService
                                        .searchPages(query)
                                ]);

                            }),

                            finalize(() => {

                                this.isLoading = false;

                                this.cdr.detectChanges();

                            })

                        );

                }),

                takeUntilDestroyed(
                    this.destroyRef
                )

            )

            .subscribe({

                next: results => {

                    this.results = results;

                    this.selectedIndex = 0;

                    this.isLoading = false;

                    this.cdr.detectChanges();

                },

                error: error => {

                    console.error(
                        'Global search stream failed:',
                        error
                    );

                    this.results = [];

                    this.selectedIndex = 0;

                    this.isLoading = false;

                    this.cdr.detectChanges();

                }

            });

    }


    // =========================================================
    // INPUT
    // =========================================================

onInput(event: Event): void {

    const input =
        event.target as HTMLInputElement;

    this.query =
        input.value;

    const normalizedQuery =
        this.query.trim();

    this.selectedIndex = 0;

    this.isOpen =
        normalizedQuery.length > 0;

    this.searchQuery$.next(
        normalizedQuery
    );

}


    // =========================================================
    // OPEN SEARCH
    // =========================================================

openSearch(): void {

    this.isOpen = true;

    setTimeout(() => {

        const input =
            this.searchInput?.nativeElement;

        if (!input) {
            return;
        }

        input.focus();
        input.select();

    });

}


    // =========================================================
    // CLOSE SEARCH
    // =========================================================

    closeSearch(): void {

        this.isOpen = false;

        this.query = '';

        this.results = [];

        this.selectedIndex = 0;

        this.isLoading = false;

        this.searchQuery$.next('');

        this.closeStudentQuickView();

        this.closeTeacherQuickView();

    }


    // =========================================================
    // RESULT SELECTION
    //
    // IMPORTANT:
    // Receives the actual result object.
    //
    // We do NOT call results.indexOf(result) here.
    // =========================================================

    selectResult(
        result: GlobalSearchResult
    ): void {

        if (!result) {
            return;
        }


        // -------------------------------------------------------
        // STUDENT
        // -------------------------------------------------------

        if (
            result.type === 'student' &&
            result.id !== undefined
        ) {

            this.openStudentQuickView(
                result.id,
                result
            );

            return;

        }


        // -------------------------------------------------------
        // TEACHER
        // -------------------------------------------------------

        if (
            result.type === 'teacher' &&
            result.id !== undefined
        ) {

            this.openTeacherQuickView(
                result.id,
                result
            );

            return;

        }


        // -------------------------------------------------------
        // PAGE / ACTION
        // -------------------------------------------------------

        this.navigate(result);

    }


    // =========================================================
    // OPEN STUDENT QUICK VIEW
    // =========================================================
    openStudentQuickView(
        studentId: number,
        result?: GlobalSearchResult
    ): void {
        if (!Number.isFinite(studentId) || studentId <= 0) {
            return;
        }

        // Invalidate any active teacher quick view.
        this.closeTeacherQuickView();

        this.quickViewResult = result ?? null;
        this.cdr.detectChanges();
    }


    // =========================================================
    // CLOSE STUDENT QUICK VIEW
    // =========================================================

    closeStudentQuickView(): void {
        this.quickViewResult = null;
        this.cdr.detectChanges();
    }


    // =========================================================
    // OPEN TEACHER QUICK VIEW
    // =========================================================

    openTeacherQuickView(
        teacherId: number,
        result?: GlobalSearchResult
    ): void {

        if (!teacherId) {
            return;
        }


        // -------------------------------------------------------
        // Every click gets a NEW request ID.
        // -------------------------------------------------------

        const requestId =
            ++this.teacherQuickViewRequestId;


        // -------------------------------------------------------
        // Invalidate student request.
        // -------------------------------------------------------
        this.closeStudentQuickView();


        // -------------------------------------------------------
        // Prepare teacher panel IMMEDIATELY.
        // -------------------------------------------------------

        this.quickViewTeacher = null;

        this.quickViewResult =
            result ?? null;

        this.isTeacherQuickViewLoading =
            true;


        this.isOpen = true;


        this.cdr.detectChanges();


        // -------------------------------------------------------
        // Load teacher details.
        // -------------------------------------------------------

        this.searchService
            .getTeacherQuickView(teacherId)
            .pipe(

                takeUntilDestroyed(
                    this.destroyRef
                ),

                finalize(() => {

                    if (
                        requestId ===
                        this.teacherQuickViewRequestId
                    ) {

                        this.isTeacherQuickViewLoading =
                            false;

                        this.cdr.detectChanges();

                    }

                })

            )

            .subscribe({

                next: teacher => {

                    if (
                        requestId !==
                        this.teacherQuickViewRequestId
                    ) {
                        return;
                    }


                    this.quickViewTeacher =
                        teacher;


                    this.cdr.detectChanges();

                },

                error: error => {

                    if (
                        requestId !==
                        this.teacherQuickViewRequestId
                    ) {
                        return;
                    }


                    console.error(
                        'Teacher Quick View failed:',
                        error
                    );


                    this.quickViewTeacher =
                        null;


                    this.cdr.detectChanges();

                }

            });

    }


    // =========================================================
    // CLOSE TEACHER QUICK VIEW
    // =========================================================

    closeTeacherQuickView(): void {

        this.teacherQuickViewRequestId++;

        this.quickViewTeacher = null;

        if (!this.quickViewResult) {

            this.quickViewResult =
                null;

        }

        this.isTeacherQuickViewLoading = false;

        this.cdr.detectChanges();

    }


    // =========================================================
    // NAVIGATION
    // =========================================================

    navigate(
        result: GlobalSearchResult
    ): void {

        if (!result.route) {
            return;
        }

        this.closeSearch();

        void this.router.navigateByUrl(
            result.route
        );

    }


    // =========================================================
    // KEYBOARD NAVIGATION
    // =========================================================

    onKeyDown(
        event: KeyboardEvent
    ): void {

        if (
            event.key === 'ArrowDown'
        ) {

            event.preventDefault();

            if (!this.results.length) {
                return;
            }

            this.selectedIndex =
                (
                    this.selectedIndex + 1
                )
                % this.results.length;

            this.scrollSelectedResultIntoView();
            return;

        }


        if (
            event.key === 'ArrowUp'
        ) {

            event.preventDefault();

            if (!this.results.length) {
                return;
            }

            this.selectedIndex =
                (
                    this.selectedIndex
                    - 1
                    + this.results.length
                )
                % this.results.length;

            this.scrollSelectedResultIntoView();

            return;

        }


        if (
            event.key === 'Enter'
        ) {

            event.preventDefault();

            const result =
                this.results[this.selectedIndex];

            if (result) {

                this.selectResult(
                    result
                );

            }

            return;

        }


        if (
            event.key === 'Escape'
        ) {

            event.preventDefault();

            this.closeSearch();

        }

    }

private scrollSelectedResultIntoView(): void {

    setTimeout(() => {

        const selectedElement =
            document.querySelector(
                '.search-results .search-result.selected'
            ) as HTMLElement | null;

        selectedElement?.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
        });

    });

}


    // =========================================================
    // GLOBAL SEARCH SHORTCUT
    // =========================================================

    @HostListener(
        'document:keydown',
        ['$event']
    )
    handleGlobalShortcut(
        event: KeyboardEvent
    ): void {

        const modifierPressed =
            event.ctrlKey ||
            event.metaKey;

        if (
            modifierPressed &&
            event.key.toLowerCase() === 'k'
        ) {

            event.preventDefault();

            this.openSearch();

        }

    }


    // =========================================================
    // CLICK OUTSIDE
    // =========================================================

    @HostListener(
        'document:click',
        ['$event']
    )
    handleDocumentClick(
        event: MouseEvent
    ): void {

        const target =
            event.target as HTMLElement;

        if (
            !target.closest(
                '.global-search'
            )
        ) {

            this.closeSearch();

        }

    }


    // =========================================================
    // TEMPLATE HELPERS
    // =========================================================

    trackResult(
        index: number,
        result: GlobalSearchResult
    ): string {

        return `${result.type}-${result.id ??
            result.route ??
            index
            }`;

    }


    getCategoryLabel(
        type: GlobalSearchResult['type']
    ): string {

        switch (type) {

            case 'student':
                return 'Students';

            case 'teacher':
                return 'Teachers';

            case 'page':
                return 'Pages';

            case 'action':
                return 'Actions';

            default:
                return 'Results';

        }

    }


    showCategory(
        type: GlobalSearchResult['type']
    ): boolean {

        return this.results.some(
            result =>
                result.type === type
        );

    }


    getResultsByType(
        type: GlobalSearchResult['type']
    ): GlobalSearchResult[] {

        return this.results.filter(
            result =>
                result.type === type
        );

    }

    navigateToStudent(studentId: number): void {
    this.router.navigate(['/admin/students', studentId]);
    this.closeStudentQuickView();
}

}
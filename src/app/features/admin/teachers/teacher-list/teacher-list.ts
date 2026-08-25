import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { TeacherListResponse, TeacherService } from '../services/teacher.service';
import { Teacher } from '../models/teacher.model';
import { Router } from '@angular/router';
import { 
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector:'app-teacher-list',
  standalone:true,
  imports:[
    CommonModule,
    DataTableComponent,
    PaginationComponent,
    SearchInputComponent
  ],
  templateUrl:'./teacher-list.html',
  styleUrl:'./teacher-list.scss'
})
export class TeacherList implements OnInit {

  private readonly router=inject(Router);

private readonly teacherService = inject(TeacherService);
private readonly cdr = inject(ChangeDetectorRef);

  teachers:Teacher[] = [];
  loading=false;
  search='';
  page=0;
  size=10;
  totalElements=0;

  columns:TableColumn[]=[
    {key:'teacherNumber',label:'Teacher No.'},
    {key:'firstName',label:'First Name'},
    {key:'lastName',label:'Last Name'},
    {key:'email',label:'Email'},
    {key:'phone',label:'Phone'},
    {key:'isActive',label:'Status'}
  ];

  actions:TableAction[]=[
    {label:'View',type:'view'},
    {label:'Edit',type:'edit'},
    {label:'Status',type:'status'}
  ];

  ngOnInit(): void {
    console.log('TeacherList INIT');
    this.loadTeachers();
  }

loadTeachers(){

this.loading=true;
this.cdr.detectChanges();

this.teacherService
.getTeachers(this.page,this.size,this.search)
.subscribe({
next:(response)=>{

this.teachers=response.data.content;
this.totalElements=response.data.totalElements;
this.loading=false;

this.cdr.detectChanges();

},
error:(error)=>{

console.error(error);
this.loading=false;

this.cdr.detectChanges();

}
});

}

  onSearch(value:string){
    this.search=value;
    this.page=0;
    this.loadTeachers();
  }

  onPageChange(page:number){
    this.page=page-1;
    this.loadTeachers();
  }

onAction(event:any){

const id=Number(event.row['id']);

switch(event.action.type){

case 'view':
this.router.navigate(['/admin/teachers',id]);
break;

case 'edit':
this.router.navigate(['/admin/teachers',id,'edit']);
break;

case 'status':
console.log('status change',id);
break;

}

}
}
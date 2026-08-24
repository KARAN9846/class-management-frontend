import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubjectService, Subject, SubjectRequest } from './subject.service';
import { ClassService } from '../classes/class.service';
import { AcademicClass } from '../classes/class.model';

interface AcademicSubject {
  id:number;
  name:string;
  code:string;
  classId:number;
  className:string;
  academicYear:string;
  status:'ACTIVE'|'INACTIVE';
}

@Component({
  selector:'app-subjects',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl:'./subjects.html',
  styleUrl:'./subjects.scss'
})
export class SubjectsComponent implements OnInit {

private readonly subjectService=inject(SubjectService);
private readonly classService=inject(ClassService);
private readonly cdr=inject(ChangeDetectorRef);

searchTerm='';
classFilter:number|'ALL'='ALL';
statusFilter:'ALL'|'ACTIVE'|'INACTIVE'='ALL';

showForm=false;
editingSubject:AcademicSubject|null=null;

subjects:AcademicSubject[]=[];

classes:{id:number;name:string;academicYear:string}[]=[];

form={
name:'',
code:'',
classId:1,
status:'ACTIVE' as 'ACTIVE'|'INACTIVE'
};


ngOnInit():void{
this.loadClasses();
this.loadSubjects();
}


loadClasses():void{

this.classService.getClasses()
.subscribe({

next:response=>{

this.classes=response.data.map((academicClass:AcademicClass)=>({
id:academicClass.id,
name:academicClass.name,
academicYear:''
}));

if(this.classes.length>0 && !this.form.classId){
this.form.classId=this.classes[0].id;
}

this.cdr.detectChanges();

},

error:error=>{
console.error('Load classes failed',error);
}

});

}


loadSubjects():void{

this.subjectService.getSubjects()
.subscribe({

next:response=>{

this.subjects=response.data.map((subject:Subject)=>({

id:subject.id,
name:subject.name,
code:subject.code,
classId:subject.classId,
className:subject.className,
academicYear:subject.academicYear,
status:'ACTIVE'

}));

this.cdr.detectChanges();

},

error:error=>{
console.error('Load subjects failed',error);
}

});

}



get filteredSubjects():AcademicSubject[]{

return this.subjects.filter(subject=>{

const search=this.searchTerm.toLowerCase().trim();

const matchesSearch=
!search ||
subject.name.toLowerCase().includes(search) ||
subject.code.toLowerCase().includes(search);

const matchesStatus=
this.statusFilter==='ALL' ||
subject.status===this.statusFilter;

const matchesClass=
this.classFilter==='ALL' ||
subject.classId===this.classFilter;

return matchesSearch && matchesStatus && matchesClass;

});

}



openAddForm():void{

this.editingSubject=null;

this.form={
name:'',
code:'',
classId:1,
status:'ACTIVE'
};

this.showForm=true;

}



openEditForm(subject:AcademicSubject):void{

this.editingSubject=subject;

this.form={
name:subject.name,
code:subject.code,
classId:subject.classId,
status:subject.status
};

this.showForm=true;

}



closeForm():void{

this.showForm=false;
this.editingSubject=null;

}



saveSubject():void{

const name=this.form.name.trim();
const code=this.form.code.trim();

if(!name || !code || !this.form.classId){
return;
}

const request:SubjectRequest={
name,
code,
classId:this.form.classId
};


if(this.editingSubject){

this.subjectService
.updateSubject(
this.editingSubject.id,
request
)
.subscribe({

next:response=>{

const index=this.subjects.findIndex(
s=>s.id===this.editingSubject?.id
);

if(index!==-1){

this.subjects[index].name=
response.data.name;
this.subjects[index].code=
response.data.code;
this.subjects[index].classId=
response.data.classId;
this.subjects[index].className=
response.data.className;
this.subjects[index].academicYear=
response.data.academicYear;

}

this.closeForm();
this.cdr.detectChanges();

},

error:error=>{
console.error(error);
}

});

return;

}



this.subjectService
.createSubject(request)
.subscribe({

next:response=>{


this.subjects.unshift({

id:response.data.id,
name:response.data.name,
code:response.data.code,
classId:response.data.classId,
className:response.data.className,
academicYear:response.data.academicYear,
status:'ACTIVE'

});


this.closeForm();

this.cdr.detectChanges();


},

error:error=>{
console.error(error);
}

});


}



deleteSubject(subject:AcademicSubject):void{

if(!confirm(
`Delete ${subject.name}?`
)){
return;
}


this.subjectService
.deleteSubject(subject.id)
.subscribe({

next:()=>{

this.subjects=
this.subjects.filter(
s=>s.id!==subject.id
);

this.cdr.detectChanges();

},

error:error=>{
console.error(error);
}

});


}

}

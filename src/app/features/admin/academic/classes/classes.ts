import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';


import {
  AcademicClass,
  Section,
  CreateSectionRequest
} from './class.model';


import { ClassService } from './class.service';

import { SectionService } from './section.service';


import { AcademicYearService } 
from '../academic-years/services/academic-year.service';



@Component({

  selector: 'app-classes',

  standalone:true,

  imports:[
    CommonModule,
    FormsModule
  ],

  templateUrl:'./classes.html',

  styleUrl:'./classes.scss'

})


export class ClassesComponent implements OnInit {



private readonly classService =
inject(ClassService);


private readonly sectionService =
inject(SectionService);


private readonly academicYearService =
inject(AcademicYearService);


private readonly cdr =
inject(ChangeDetectorRef);





searchTerm='';


academicYearFilter:number | 'ALL' =
'ALL';





showForm=false;


editingClass:AcademicClass | null = null;




showSectionForm=false;


editingSection:Section | null = null;


selectedClass:AcademicClass | null = null;





academicYears:
{
 id:number;
 name:string;

}[]=[];





classes:AcademicClass[]=[];





form={

 name:'',

 academicYearId:1

};





sectionForm:CreateSectionRequest={

 classId:0,

 name:''

};





ngOnInit():void{

 this.loadClasses();

}









// =========================
// LOAD CLASSES
// =========================


loadClasses():void{


this.academicYearService
.getAll()

.subscribe({

next:yearsResponse=>{


this.academicYears =
yearsResponse.data.content.map(
year=>({

id:year.id,

name:year.name

})

);




this.classService
.getClasses()

.subscribe({

next:classesResponse=>{


this.classes =
classesResponse.data.map(cls=>{


const year =
yearsResponse.data.content.find(
y=>y.id===cls.academicYearId
);



return {

...cls,

academicYear:
year?.name ?? '',

sections:[]

};


});



this.loadSections();



},


error:error=>{

console.error(
'Failed loading classes',
error
);

}


});



}


});


}









// =========================
// LOAD SECTIONS
// =========================


loadSections():void{


if(this.classes.length===0){

return;

}




const requests =
this.classes.map(cls=>

this.sectionService
.getSections(cls.id)

);




forkJoin(requests)

.subscribe({

next:responses=>{


this.classes =
this.classes.map(
(cls,index)=>({

...cls,

sections:
responses[index].data

})

);



this.cdr.detectChanges();



},


error:error=>{

console.error(
'Failed loading sections',
error
);


}


});


}









// =========================
// FILTER
// =========================


get filteredClasses():AcademicClass[]{


return this.classes.filter(cls=>{


const search =
this.searchTerm
.toLowerCase();



const matchesSearch =

cls.name
.toLowerCase()
.includes(search);



const matchesYear =

this.academicYearFilter==='ALL'

||

cls.academicYearId ===
this.academicYearFilter;



return (

matchesSearch

&&

matchesYear

);


});


}









// =========================
// CLASS FORM
// =========================


openAddForm():void{


this.editingClass=null;


this.form={

name:'',

academicYearId:
this.academicYears[0]?.id ?? 1

};


this.showForm=true;


}





openEditForm(
cls:AcademicClass
):void{


this.editingClass=cls;


this.form={

name:cls.name,

academicYearId:
cls.academicYearId

};


this.showForm=true;


}





closeForm():void{


this.showForm=false;


this.editingClass=null;


}









saveClass():void{


const request={


name:
this.form.name.trim(),


academicYearId:
this.form.academicYearId


};





if(this.editingClass){


this.classService
.updateClass(

this.editingClass.id,

request

)

.subscribe({

next:()=>{

this.closeForm();

this.loadClasses();

},

error:error=>{

console.error(
'Update failed',
error
);

}


});


return;


}







this.classService
.createClass(request)

.subscribe({

next:()=>{


this.closeForm();


this.loadClasses();


},


error:error=>{

console.error(
'Create failed',
error
);

}


});


}









deleteClass(
cls:AcademicClass
):void{


if(!confirm(
`Delete ${cls.name}?`
)){

return;

}



this.classService
.deleteClass(cls.id)

.subscribe({

next:()=>{

this.loadClasses();

},


error:error=>{

console.error(
'Delete failed',
error
);

}


});


}









// =========================
// SECTION FORM
// =========================


openAddSectionForm(
cls:AcademicClass
):void{


this.selectedClass=cls;


this.editingSection=null;


this.sectionForm={

classId:cls.id,

name:''

};


this.showSectionForm=true;


}





openEditSectionForm(
section:Section
):void{


this.editingSection=section;


this.sectionForm={

classId:
section.classId,

name:
section.name

};


this.showSectionForm=true;


}





closeSectionForm():void{


this.showSectionForm=false;


this.editingSection=null;


}









saveSection():void{


if(
!this.sectionForm.name.trim()
){

return;

}





const request:CreateSectionRequest={


classId:
this.sectionForm.classId,


name:
this.sectionForm.name.trim()


};





if(this.editingSection){


this.sectionService
.updateSection(

this.editingSection.id,

request

)

.subscribe({

next:()=>{


this.closeSectionForm();


this.loadClasses();


}


});



return;


}







this.sectionService
.createSection(request)

.subscribe({

next:()=>{


this.closeSectionForm();


this.loadClasses();


}


});



}









deleteSection(
section:Section
):void{


if(!confirm(
`Delete section ${section.name}?`
)){

return;

}




this.sectionService
.deleteSection(section.id)

.subscribe({

next:()=>{


this.loadClasses();


}


});


}




}
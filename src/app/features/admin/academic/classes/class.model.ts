import { Section } from './section.model';

export interface AcademicClass {
  id: number;
  name: string;
  academicYearId: number;
  academicYear?: string;
  sections: Section[];
}
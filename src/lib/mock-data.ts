import type { Student, Course, Enrollment } from "@/lib/types";

export const students: Student[] = [
  {
    studentId: "650610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
    status: "Active",
    enrolledCourses: [],
  },
  {
    studentId: "650610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
    status: "Active",
    enrolledCourses: ["CPE301", "CPE302"],
  },
  {
    studentId: "650610003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
    status: "Active",
    enrolledCourses: ["ISNE101", "CPE302"],
  },
];

export const courses: Course[] = [
  {
    courseCode: "CPE301",
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseCode: "CPE302",
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseCode: "ISNE101",
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];

export const enrollments: Enrollment[] = [
  { studentId: "650610002", courseCode: "CPE301" },
  { studentId: "650610002", courseCode: "CPE302" },
  { studentId: "650610003", courseCode: "ISNE101" },
  { studentId: "650610003", courseCode: "CPE302" },
];

export const CURRENT_STUDENT_ID = "650610002";
export const currentStudent = students.find(
  (s) => s.studentId === CURRENT_STUDENT_ID,
)!;

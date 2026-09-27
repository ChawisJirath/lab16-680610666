import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  removeStudent: (studentId: string) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  removeInstructor: (courseCode: string, instructorIndex: number) => void;
  addEnrollments: (courseCode: string, studentIds: string[]) => void;
  removeEnrollment: (courseCode: string, studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((student) => student.studentId !== studentId),
        })),

      addCourse: (course) =>
        set((state) => ({
          courses: state.courses.some(
            (item) =>
              item.courseCode.trim().toLowerCase() ===
              course.courseCode.trim().toLowerCase(),
          )
            ? state.courses
            : [...state.courses, course],
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.courseCode !== courseCode),
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: (student.enrolledCourses || []).filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      removeInstructor: (courseCode, instructorIndex) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode === courseCode
              ? {
                  ...course,
                  instructors: (course.instructors ?? []).filter(
                    (_, index) => index !== instructorIndex,
                  ),
                }
              : course,
          ),
        })),

      addEnrollments: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((student) =>
            studentIds.includes(student.studentId) &&
            !(student.enrolledCourses || []).includes(courseCode)
              ? {
                  ...student,
                  enrolledCourses: [...(student.enrolledCourses || []), courseCode],
                }
              : student,
          ),
        })),

      removeEnrollment: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.studentId === studentId
              ? {
                  ...student,
                  enrolledCourses: (student.enrolledCourses || []).filter(
                    (code) => code !== courseCode,
                  ),
                }
              : student,
          ),
        })),
    }),
    {
      name: "lab16-2569-680610666",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
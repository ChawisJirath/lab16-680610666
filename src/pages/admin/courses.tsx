import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } =
    useEnrollmentStore();

  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [instructorInput, setInstructorInput] = useState("");
  const [open, setOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const instructorComboboxAnchor = useComboboxAnchor();

  const instructorOptions = courses
    .flatMap((course) => course.instructors ?? [])
    .concat(selectedInstructors)
    .reduce<string[]>((unique, rawInstructor) => {
      const instructor = rawInstructor.trim();
      if (
        instructor &&
        !unique.some(
          (existing) => existing.toLowerCase() === instructor.toLowerCase(),
        )
      ) {
        unique.push(instructor);
      }
      return unique;
    }, []);

  const trimmedInstructorInput = instructorInput.trim();
  const normalizedInstructorInput = trimmedInstructorInput.toLowerCase();
  const matchingInstructorOptions = instructorOptions.filter((instructor) =>
    instructor.toLowerCase().includes(normalizedInstructorInput),
  );
  const instructorAlreadyExists = instructorOptions.some(
    (instructor) => instructor.toLowerCase() === normalizedInstructorInput,
  );
  const instructorComboboxItems = [
    ...matchingInstructorOptions,
    ...(trimmedInstructorInput && !instructorAlreadyExists
      ? [trimmedInstructorInput]
      : []),
  ];

  const duplicateCourse = courses.find(
    (course) =>
      course.courseCode.trim().toLowerCase() === courseCode.trim().toLowerCase(),
  );

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setSelectedInstructors([]);
    setInstructorInput("");
  };

  const handleAddCourse = () => {
    const normalizedCode = courseCode.trim().toUpperCase();
    const trimmedTitle = courseTitle.trim();

    if (!normalizedCode || !trimmedTitle || duplicateCourse) return;

    const newCourse: Course = {
      courseCode: normalizedCode,
      courseTitle: trimmedTitle,
      instructors: selectedInstructors,
    };

    addCourse(newCourse);
    resetForm();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่แล้วจะไปโผล่เป็นตัวเลือก  ตอนลงทะเบียนให้นักศึกษาที่หน้า “จัดการการลงทะเบียน” ทันที
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) resetForm();
          }}
        >
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>

          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาเรียน</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label htmlFor="courseCode" className="text-sm font-medium">
                  รหัสวิชา
                </label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(event) => setCourseCode(event.target.value)}
                  placeholder="เช่น CS101"
                  aria-invalid={Boolean(duplicateCourse)}
                  aria-describedby={
                    duplicateCourse ? "course-code-error" : undefined
                  }
                />
                {duplicateCourse && (
                  <p
                    id="course-code-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    มีรหัสวิชา {duplicateCourse.courseCode} นี้แล้ว
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="courseTitle" className="text-sm font-medium">
                  ชื่อวิชา
                </label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(event) => setCourseTitle(event.target.value)}
                  placeholder="เช่น Introduction to Programming"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="courseInstructors" className="text-sm font-medium">
                  ผู้สอน
                </label>
                <Combobox
                  multiple
                  items={instructorComboboxItems}
                  value={selectedInstructors}
                  onValueChange={(value) =>
                    setSelectedInstructors(value as string[])
                  }
                  onInputValueChange={setInstructorInput}
                  autoHighlight
                  itemToStringLabel={(value) => value}
                >
                  <ComboboxChips
                    ref={instructorComboboxAnchor}
                    className="min-h-8 w-full flex-wrap"
                  >
                    {selectedInstructors.map((instructor) => (
                      <ComboboxChip key={instructor}>{instructor}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      id="courseInstructors"
                      placeholder={
                        selectedInstructors.length > 0
                          ? ""
                          : "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                      }
                    />
                  </ComboboxChips>
                  <ComboboxContent anchor={instructorComboboxAnchor.current}>
                    <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
                    <ComboboxList>
                      {matchingInstructorOptions.map((instructor) => (
                        <ComboboxItem key={instructor} value={instructor}>
                          {instructor}
                        </ComboboxItem>
                      ))}
                      {trimmedInstructorInput && !instructorAlreadyExists && (
                        <ComboboxItem value={trimmedInstructorInput}>
                          + เพิ่มผู้สอน "{trimmedInstructorInput}"
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={
                  !courseCode.trim() || !courseTitle.trim() || Boolean(duplicateCourse)
                }
                onClick={handleAddCourse}
              >
                <PlusCircle className="h-4 w-4" />
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="w-[90px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ยังไม่มีวิชาที่เปิดสอน
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>
                    {course.instructors?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {course.instructors.map((instructor, index) => (
                          <Badge
                            key={`${instructor}-${index}`}
                            variant="outline"
                            className="gap-1.5 border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {instructor}
                            <button
                              type="button"
                              aria-label={`นำ ${instructor} ออกจากวิชา ${course.courseCode}`}
                              onClick={() =>
                                removeInstructor(course.courseCode, index)
                              }
                              className="-mr-1 inline-flex size-4 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-900"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setCourseToDelete(course)}
                      aria-label={`ลบวิชา ${course.courseCode}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={Boolean(courseToDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setCourseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ {courseToDelete?.courseCode} — {courseToDelete?.courseTitle} ออกจากรายวิชาที่เปิดสอน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (courseToDelete) removeCourse(courseToDelete.courseCode);
                setCourseToDelete(null);
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

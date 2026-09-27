import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, addEnrollments, removeEnrollment } =
    useEnrollmentStore();

  const enrollments = students.flatMap((student) =>
    student.enrolledCourses.map((courseId) => ({
      studentId: student.studentId,
      courseId,
    })),
  );

  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const studentComboboxAnchor = useComboboxAnchor();
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  const availableStudentOptions = studentOptions.filter(
    (student) =>
      !enrollments.some(
        (enrollment) =>
          enrollment.studentId === student.value &&
          enrollment.courseId === formCourse,
      ),
  );

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    addEnrollments(formCourse, formStudents);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudents([]);
      setFormCourse(null);
    }
  };

  const rows = enrollments.filter((e) =>
    mode === "course"
      ? filterCourse === "all" || e.courseId === filterCourse
      : filterStudent === "all" || e.studentId === filterStudent
  );

  const courseRows = courses
    .filter((course) =>
      mode === "course"
        ? filterCourse === "all" || course.courseCode === filterCourse
        : filterStudent === "all" ||
          rows.some((enrollment) => enrollment.courseId === course.courseCode),
    )
    .map((course) => ({
      ...course,
      studentIds: enrollments
        .filter((enrollment) => enrollment.courseId === course.courseCode)
        .map((enrollment) => enrollment.studentId),
    }));

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น
              (เลือกได้มากกว่า 1 คน)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(value) => {
                  setFormCourse(value);
                  setFormStudents([]);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formStudents">นักศึกษา</Label>
              <Combobox
                multiple
                items={availableStudentOptions}
                value={formStudents}
                onValueChange={(value) => setFormStudents(value as string[])}
                disabled={!formCourse}
              >
                <ComboboxChips
                  ref={studentComboboxAnchor}
                  className="min-h-8 w-full flex-wrap"
                >
                  {formStudents.map((studentId) => (
                    <ComboboxChip key={studentId}>
                      {nameOf(studentId)}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="formStudents"
                    placeholder={
                      !formCourse
                        ? "เลือกวิชาก่อน"
                        : formStudents.length > 0
                          ? ""
                          : availableStudentOptions.length === 0
                          ? "นักศึกษาลงทะเบียนวิชานี้ครบทุกคนแล้ว"
                          : "ค้นหา/เลือกนักศึกษา"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={studentComboboxAnchor.current}>
                  <ComboboxEmpty>
                    ไม่พบนักศึกษา
                  </ComboboxEmpty>
                  <ComboboxList>
                    {availableStudentOptions.map((student) => (
                      <ComboboxItem key={student.value} value={student.value}>
                        {student.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              {formStudents.length === 0
                ? "ลงทะเบียน"
                : `ลงทะเบียน (${formStudents.length} คน)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {courseRows.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell>{course.studentIds.length}</TableCell>
                <TableCell>
                  {course.studentIds.length === 0 ? (
                    <span className="text-muted-foreground">
                      ยังไม่มีนักศึกษาลงทะเบียน
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {course.studentIds.map((studentId) => (
                        <Badge
                          key={studentId}
                          variant="outline"
                          className="gap-1.5 border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {nameOf(studentId)}
                          <button
                            type="button"
                            aria-label={`ยกเลิกการลงทะเบียน ${nameOf(studentId)} ในวิชา ${course.courseCode}`}
                            onClick={() =>
                              removeEnrollment(course.courseCode, studentId)
                            }
                            className="-mr-1 inline-flex size-4 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-900"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
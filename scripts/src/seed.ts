import { db, departmentsTable, coursesTable, studentsTable } from "@workspace/db";

async function main() {
  const existing = await db.select().from(departmentsTable).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  const departments = await db
    .insert(departmentsTable)
    .values([
      {
        name: "Computer Science",
        code: "CS",
        description: "Study of algorithms, software, and computer systems.",
      },
      {
        name: "Electrical Engineering",
        code: "EE",
        description: "Study of electricity, electronics, and electromagnetism.",
      },
      {
        name: "Business Administration",
        code: "BA",
        description: "Study of management, finance, and organizational leadership.",
      },
    ])
    .returning();

  const [cs, ee, ba] = departments;

  const courses = await db
    .insert(coursesTable)
    .values([
      { name: "Data Structures & Algorithms", code: "CS201", departmentId: cs.id, credits: 4 },
      { name: "Database Systems", code: "CS305", departmentId: cs.id, credits: 3 },
      { name: "Web Development", code: "CS210", departmentId: cs.id, credits: 3 },
      { name: "Circuit Theory", code: "EE101", departmentId: ee.id, credits: 4 },
      { name: "Digital Signal Processing", code: "EE302", departmentId: ee.id, credits: 3 },
      { name: "Financial Accounting", code: "BA150", departmentId: ba.id, credits: 3 },
      { name: "Marketing Fundamentals", code: "BA210", departmentId: ba.id, credits: 3 },
    ])
    .returning();

  const students = [
    {
      studentCode: "STU2024001",
      fullName: "Alice Johnson",
      email: "alice.johnson@campus.edu",
      phone: "555-0101",
      gender: "female" as const,
      dateOfBirth: "2003-04-12",
      address: "12 Maple St, Springfield",
      departmentId: cs.id,
      courseId: courses[0].id,
      year: 2,
      semester: 3,
      cgpa: 3.75,
      attendancePercentage: 92.50,
    },
    {
      studentCode: "STU2024002",
      fullName: "Brian Chen",
      email: "brian.chen@campus.edu",
      phone: "555-0102",
      gender: "male" as const,
      dateOfBirth: "2002-11-03",
      address: "45 Oak Ave, Springfield",
      departmentId: cs.id,
      courseId: courses[1].id,
      year: 3,
      semester: 5,
      cgpa: 3.42,
      attendancePercentage: 88.00,
    },
    {
      studentCode: "STU2024003",
      fullName: "Carla Diaz",
      email: "carla.diaz@campus.edu",
      phone: "555-0103",
      gender: "female" as const,
      dateOfBirth: "2004-01-22",
      address: "78 Pine Rd, Rivertown",
      departmentId: cs.id,
      courseId: courses[2].id,
      year: 1,
      semester: 1,
      cgpa: 3.90,
      attendancePercentage: 95.00,
    },
    {
      studentCode: "STU2024004",
      fullName: "David Osei",
      email: "david.osei@campus.edu",
      phone: "555-0104",
      gender: "male" as const,
      dateOfBirth: "2003-07-08",
      address: "9 Birch Ln, Rivertown",
      departmentId: ee.id,
      courseId: courses[3].id,
      year: 2,
      semester: 4,
      cgpa: 3.10,
      attendancePercentage: 81.25,
    },
    {
      studentCode: "STU2024005",
      fullName: "Emma Wilson",
      email: "emma.wilson@campus.edu",
      phone: "555-0105",
      gender: "female" as const,
      dateOfBirth: "2002-09-15",
      address: "33 Cedar Ct, Hillview",
      departmentId: ee.id,
      courseId: courses[4].id,
      year: 4,
      semester: 7,
      cgpa: 3.60,
      attendancePercentage: 90.00,
    },
    {
      studentCode: "STU2024006",
      fullName: "Farid Hassan",
      email: "farid.hassan@campus.edu",
      phone: "555-0106",
      gender: "male" as const,
      dateOfBirth: "2003-03-30",
      address: "21 Elm St, Hillview",
      departmentId: ba.id,
      courseId: courses[5].id,
      year: 2,
      semester: 3,
      cgpa: 2.95,
      attendancePercentage: 77.50,
    },
    {
      studentCode: "STU2024007",
      fullName: "Grace Kim",
      email: "grace.kim@campus.edu",
      phone: "555-0107",
      gender: "female" as const,
      dateOfBirth: "2004-05-19",
      address: "60 Willow Dr, Springfield",
      departmentId: ba.id,
      courseId: courses[6].id,
      year: 1,
      semester: 2,
      cgpa: 3.55,
      attendancePercentage: 93.75,
    },
    {
      studentCode: "STU2024008",
      fullName: "Hassan Ali",
      email: "hassan.ali@campus.edu",
      phone: "555-0108",
      gender: "male" as const,
      dateOfBirth: "2002-12-01",
      address: "5 Aspen Way, Rivertown",
      departmentId: cs.id,
      courseId: courses[0].id,
      year: 3,
      semester: 6,
      cgpa: 3.30,
      attendancePercentage: 85.00,
    },
  ];

  await db.insert(studentsTable).values(students);

  console.log(
    `Seeded ${departments.length} departments, ${courses.length} courses, ${students.length} students.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

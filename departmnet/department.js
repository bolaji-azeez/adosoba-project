const departmentId = "68aece73d0d1e7fe88f052e4";

async function fetchStudents() {
  try {
    const response = await fetch(
      `https://gtc-adosoba-be.onrender.com/api/student/department/${departmentId}`
    );
    const text = await response.text();
    console.log("Raw response:", text);

    try {
      const data = JSON.parse(text);
      renderStudents(data.student);
    } catch (err) {
      console.error("Response was not JSON:", err);
    }

    if (response.ok) {
      renderStudents(data.student);
    } else {
      alert(data.message || "Failed to fetch students");
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching students");
  }
}

function renderStudents(students) {
  const tableBody = document.getElementById("studentsTableBody");
  tableBody.innerHTML = "";

  students.forEach((stu) => {
    const row = document.createElement("tr");

    const projectCount = stu.project ? stu.project.length : 0;

    let statusText = "NO PROJECT";
    let statusClass = "inactive";

    if (projectCount > 0) {
      const statuses = stu.project.map((p) => p.status);

      if (statuses.includes("In Progress")) {
        statusText = "ACTIVE";
        statusClass = "active";
      } else if (statuses.every((s) => s === "Completed")) {
        statusText = "COMPLETED";
        statusClass = "completed";
      } else if (statuses.every((s) => s === "Terminated")) {
        statusText = "TERMINATED";
        statusClass = "terminated";
      } else {
        statusText = statuses[0];
        statusClass = "pending";
      }
    }

    row.innerHTML = `
      <td>${stu.studentID}</td>
      <td>${stu.firstName} ${stu.lastName}</td>
      <td>${stu.email}</td>
      <td>${projectCount}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td><button class="view" onclick="viewStudent('${stu._id}')">VIEW</button></td>
    `;

    tableBody.appendChild(row);
  });
}

function viewStudent(studentId) {
  
  alert("View student with ID: " + studentId);
}

window.onload = fetchStudents;

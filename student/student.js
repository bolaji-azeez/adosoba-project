const API = "https://gtc-adosoba-be.onrender.com/api";

const val = (id) => (document.getElementById(id)?.value || "").trim();

function getProjects() {
  const nodes = document.querySelectorAll("#projects-container .project");
  const items = [];
  nodes.forEach((proj) => {
    const title = proj.querySelector(".projectTitle")?.value?.trim() || "";
    const status = proj.querySelector(".status")?.value?.trim() || "";
    const grade = proj.querySelector(".grade")?.value?.trim() || "";
    const description = proj.querySelector(".description")?.value?.trim() || "";
    if (title || status || grade || description) {
      items.push({ title, projectName: title, status, grade, description });
    }
  });
  return items;
}

function addProject() {
  const container = document.getElementById("projects-container");
  const div = document.createElement("div");
  div.classList.add("project");
  div.innerHTML = `
      <label>Project Title</label>
      <input type="text" class="projectTitle" placeholder="Enter Project Title" />

      <label>Status</label>
      <select class="status">
        <option value="In Progress">In Progress</option>
        <option value="On Hold">On Hold</option>
        <option value="Terminated">Terminated</option>
        <option value="Uncompleted">Uncompleted</option>
        <option value="Completed">Completed</option>
      </select>

      <label>Grade</label>
      <input type="text" class="grade" placeholder="Enter grade" />

      <label>Description</label>
      <textarea class="description" placeholder="Enter description"></textarea>
      <hr/>
    `;
  container.appendChild(div);
}

function cancel() {
  document.querySelector(".form-container")?.reset?.();
  document.getElementById("projects-container").innerHTML = "";
  addProject();
}

// --- Department resolver ---
async function ensureDepartmentInput() {
  const params = new URLSearchParams(location.search);
  let departmentId =
    params.get("departmentId") || localStorage.getItem("departmentId") || "";

  if (departmentId) return departmentId;

  // No id available -> inject a required <select> so the user picks one
  const form = document.querySelector(".form-container");
  const buttons = document.querySelector(".buttons");

  const wrap = document.createElement("div");
  wrap.id = "dept-picker";
  wrap.innerHTML = `
      <p class="p">Department</p>
      <label for="departmentSelect">DEPARTMENT</label>
      <select id="departmentSelect" required>
        <option value="">-- Select Department --</option>
      </select>
    `;
  form.insertBefore(wrap, buttons);

  // Load departments to populate the select
  try {
    const res = await fetch(`${API}/department/all-departments`, {
      cache: "no-store",
    });
    const data = await res.json();
    const select = document.getElementById("departmentSelect");
    (data.departments || []).forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d._id;
      opt.textContent = d.departmentName || d.name || d._id;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Failed to load departments:", e);
    alert("Could not load departments. Please try again.");
  }

  // Return empty for now; AddStudent() will read the selected value
  return "";
}

async function AddStudent() {
  // Resolve department id from URL/localStorage or from the injected <select>
  const params = new URLSearchParams(location.search);
  let departmentId =
    params.get("departmentId") || localStorage.getItem("departmentId") || "";
  if (!departmentId) {
    departmentId = document.getElementById("departmentSelect")?.value || "";
  }

  // Client-side required checks for clear feedback
  const required = {
    studentId: val("StudentId"),
    firstName: val("firstName"),
    lastName: val("lastName"),
    email: val("email"),
    phone: val("phone"), // keep as text to preserve leading zeros
    enrollmentDate: val("enrollmentDate"),
    department: departmentId,
  };

  const missing = Object.entries(required).filter(([, v]) => !v);
  if (missing.length) {
    alert(
      "Please fill all required fields: " + missing.map(([k]) => k).join(", ")
    );
    return;
  }

  const projects = getProjects();

  const payload = {
    // ID variants
    studentId: required.studentId,
    studentID: required.studentId,
    firstName: required.firstName,
    lastName: required.lastName,
    email: required.email,
    phoneNumber: required.phone,
    phone: required.phone,
    enrollmentDate: required.enrollmentDate,
    department: required.department,
    // project variants
    projects,
    project: projects[0] || null,
    status: "Active",
  };

  try {
    const res = await fetch(`${API}/student/create-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(result?.message || result?.error || "Failed to create student.");
      return;
    }

    alert("Student added successfully!");
    // keep the department id for when we go back, and redirect to that department
    localStorage.setItem("departmentId", required.department);
    window.location.href = `../../departmnet/department.html?id=${encodeURIComponent(
      required.department
    )}`;
  } catch (err) {
    console.error(err);
    alert("Something went wrong while creating the student.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!document.querySelector("#projects-container .project")) addProject();
  await ensureDepartmentInput();
});

// expose for inline handlers
window.AddStudent = AddStudent;
window.addProject = addProject;
window.cancel = cancel;

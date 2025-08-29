const urlParams = new URLSearchParams(window.location.search);
const departmentId = urlParams.get("id");

const API_BASE = "https://gtc-adosoba-be.onrender.com/api";
const studentsCache = new Map();
let studentsData = [];

const state = {
  sortBy: "name",
  status: "all",
  q: "",
  date: "",
  page: 1,
  pageSize: 50,
};

function setDepartmentInfo(dept) {
  const name = dept?.departmentName || dept?.name || "Department";
  document.getElementById("deptName").textContent = name;
  document.getElementById("breadcrumbDept").textContent = name;
  document.getElementById("deptDesc").textContent =
    dept?.description || `Department of ${name}`;
  document.getElementById("pageTitle").textContent = `${name} • GTC Adosoba`;
}

function writeDeptMetrics() {
  const totalStudentsEl = document.getElementById("totalStudents");
  const totalProjectsEl = document.getElementById("totalProjects");
  const activeCountEl = document.getElementById("activeCount");
  if (!totalStudentsEl && !totalProjectsEl && !activeCountEl) return;

  const totalStudents = studentsData.length;
  const totalProjects = studentsData.reduce((sum, s) => {
    if (Array.isArray(s.projects)) return sum + s.projects.length;
    if (s.project) return sum + 1;
    return sum;
  }, 0);
  const activeCount = studentsData.filter(
    (s) => String(s.status || "").toLowerCase() === "active"
  ).length;

  if (totalStudentsEl) totalStudentsEl.textContent = String(totalStudents);
  if (totalProjectsEl) totalProjectsEl.textContent = String(totalProjects);
  if (activeCountEl) activeCountEl.textContent = String(activeCount);
}

async function tryFetchDepartment() {
  if (!departmentId) {
    alert("Missing department id in URL (?id=...)");
    return;
  }
  const candidates = [
    `${API_BASE}/department/${departmentId}`,
    `${API_BASE}/department/department/${departmentId}`,
    `${API_BASE}/department/single-department/${departmentId}`,
  ];
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const d = await r.json();
      const dept = d?.department || d?.data || d;
      if (dept && (dept.departmentName || dept.name || dept._id)) {
        setDepartmentInfo(dept);
        return;
      }
    } catch {}
  }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

function statusOptions(current) {
  const options = ["Complete", "In Progress", "Terminated", "Uncompleted"];
  return options
    .map(
      (opt) =>
        `<option value="${opt}" ${
          String(current).toLowerCase() === opt.toLowerCase() ? "selected" : ""
        }>${opt}</option>`
    )
    .join("");
}

function projectStatusPill(status) {
  const s = String(status || "").toLowerCase();
  let color = "#e5e7eb",
    fg = "#111827";
  if (["completed"].includes(s)) {
    color = "#dcfce7";
    fg = "#065f46";
  } else if (["in progress", "ongoing"].includes(s)) {
    color = "#dbeafe";
    fg = "#1e40af";
  } else if (["on hold", "uncompleted"].includes(s)) {
    color = "#fef3c7";
    fg = "#92400e";
  } else if (["terminated", "cancelled", "canceled"].includes(s)) {
    color = "#fee2e2";
    fg = "#991b1b";
  }
  return `<span style="background:${color};color:${fg};padding:3px 8px;border-radius:999px;font-size:12px">${
    status || "—"
  }</span>`;
}

function byName(a, b) {
  const an = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
  const bn = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
  if (an < bn) return -1;
  if (an > bn) return 1;
  return 0;
}
function byDate(a, b) {
  const ad = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
  const bd = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
  return ad - bd; // ascending only
}
function byStatus(a, b) {
  const as = (a.status || "").toLowerCase();
  const bs = (b.status || "").toLowerCase();
  if (as < bs) return -1;
  if (as > bs) return 1;
  return 0;
}

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function renderPagination(total) {
  const pag = document.getElementById("pagination");
  const totalPages = Math.ceil(total / state.pageSize) || 1;
  if (totalPages <= 1) {
    pag.innerHTML = "";
    return;
  }
  const cur = Math.min(state.page, totalPages);
  let html = `<button class="page-btn" ${
    cur === 1 ? "disabled" : ""
  } data-act="prev">Prev</button>`;
  const windowSize = 7;
  let start = Math.max(1, cur - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  if (start > 1) {
    html += `<button class="page-num" data-pg="1">1</button>`;
    if (start > 2) html += `<span>…</span>`;
  }
  for (let p = start; p <= end; p++) {
    html += `<button class="page-num ${
      p === cur ? "active" : ""
    }" data-pg="${p}">${p}</button>`;
  }
  if (end < totalPages) {
    if (end < totalPages - 1) html += `<span>…</span>`;
    html += `<button class="page-num" data-pg="${totalPages}">${totalPages}</button>`;
  }
  html += `<button class="page-btn" ${
    cur === totalPages ? "disabled" : ""
  } data-act="next">Next</button>`;
  pag.innerHTML = html;
}

function renderTable() {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";
  const q = state.q.trim().toLowerCase();
  let list = studentsData.slice();

  if (state.status !== "all") {
    list = list.filter(
      (s) => String(s.status || "").toLowerCase() === state.status.toLowerCase()
    );
  }
  if (q) {
    list = list.filter(
      (s) =>
        `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(q) ||
        (s.studentId || s.matricNo || "").toLowerCase().includes(q)
    );
  }
  if (state.date) {
    list = list.filter((s) => {
      if (!s.enrollmentDate) return false;
      const d = new Date(s.enrollmentDate);
      if (isNaN(d)) return false;
      return ymd(d) === state.date;
    });
  }

  let cmp = byName;
  if (state.sortBy === "date") cmp = byDate;
  else if (state.sortBy === "status") cmp = byStatus;
  list.sort(cmp);

  const total = list.length;
  renderPagination(total);
  const totalPages = Math.ceil(total / state.pageSize) || 1;
  if (state.page > totalPages) state.page = 1;
  const start = (state.page - 1) * state.pageSize;
  const end = start + state.pageSize;
  const pageItems = list.slice(start, end);

  pageItems.forEach((stu) => {
    const id = stu._id || stu.id || "";
    studentsCache.set(id, stu);
    const fullName = `${stu.firstName || ""} ${stu.lastName || ""}`.trim();
    const email = stu.email || stu.user?.email || "—";
    const projectsCount = Array.isArray(stu.projects)
      ? stu.projects.length
      : stu.project
      ? 1
      : 0;
    const status = stu.status || "Active";
    const studentId = stu.studentId || stu.matricNo || id.slice(-8);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${studentId}</td>
      <td>${fullName || "Unnamed"}</td>
      <td>${email}</td>
      <td>${projectsCount}</td>
      <td>
        <select class="status-select" id="status-${id}">${statusOptions(
      status
    )}</select>
      </td>
      <td class="actions">
        <button class="btn" onclick="openStudentModal('${id}')">View</button>
      
      </td>`;
    tbody.appendChild(tr);
  });

  writeDeptMetrics();
}

async function fetchStudents() {
  if (!departmentId) return;
  try {
    const res = await fetch(`${API_BASE}/student/department/${departmentId}`);
    const data = await res.json();

    if (!res.ok) {
      document.getElementById(
        "studentsTableBody"
      ).innerHTML = `<tr><td colspan="6">${
        data.message || "Unable to load students."
      }</td></tr>`;
      return;
    }

    if (Array.isArray(data.student) && data.student.length > 0) {
      const dept = data.student[0].department;
      if (dept) setDepartmentInfo(dept);
    }

    studentsData = Array.isArray(data.student) ? data.student : [];
    renderTable();
  } catch (err) {
    console.error("Error fetching students:", err);
    document.getElementById(
      "studentsTableBody"
    ).innerHTML = `<tr><td colspan="6">Network error. Please try again.</td></tr>`;
  }
}

function openStudentModal(id) {
  const stu = studentsCache.get(id);
  if (!stu) return;
  const name = `${stu.firstName || ""} ${stu.lastName || ""}`.trim();
  const dept = stu.department?.departmentName || "N/A";
  const email = stu.email || stu.user?.email || "—";
  const phone = stu.phone || "—";
  const enrollmentDate = stu.enrollmentDate
    ? new Date(stu.enrollmentDate).toLocaleDateString()
    : "—";
  const status =
    document.getElementById(`status-${id}`)?.value || stu.status || "Active";
  const studentId = stu.studentId || stu.matricNo || (stu._id || "").slice(-8);
  const initials = (name || "ST")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const projects = Array.isArray(stu.projects)
    ? stu.projects
    : stu.project
    ? [stu.project]
    : [];
  const projectRows = projects.length
    ? projects
        .map((p, idx) => {
          const title = p.title || p.projectTitle || `Project ${idx + 1}`;
          const pstatus = p.status || p.projectStatus || "In Progress";
          const grade = p.grade || p.score || "—";
          const desc = p.description || p.details || "";
          return `<tr>
          <td>${idx + 1}</td>
          <td>${title}</td>
          <td>${projectStatusPill(pstatus)}</td>
          <td>${grade}</td>
          <td>${desc ? desc : "—"}</td>
        </tr>`;
        })
        .join("")
    : `<tr><td colspan="5">No Project Assigned</td></tr>`;

  const html = `
    <div class="profile">
      <div class="avatar">${initials}</div>
      <div>
        <h2 style="margin:0 0 6px 0">${name || "Student"}</h2>
        <span class="badge">${dept}</span>
        <div class="kv">
          <div class="k">Student ID</div><div>${studentId}</div>
          <div class="k">Email</div><div>${email}</div>
          <div class="k">Phone</div><div>${phone}</div>
          <div class="k">Enrollment Date</div><div>${enrollmentDate}</div>
          <div class="k">Status</div><div><select class="status-select" id="modal-status-${id}">${statusOptions(
    status
  )}</select></div>
        </div>

        <h4 class="section-title">Projects (${projects.length})</h4>
        <div class="proj-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>${projectRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;

  const content = document.getElementById("studentModalContent");
  content.innerHTML = html;
  const backdrop = document.getElementById("studentModalBackdrop");
  backdrop.style.display = "flex";
  backdrop.setAttribute("aria-hidden", "false");

  const modalSelect = document.getElementById(`modal-status-${id}`);
  modalSelect.addEventListener("change", () => {
    const tableSelect = document.getElementById(`status-${id}`);
    if (tableSelect) tableSelect.value = modalSelect.value;
  });
}

function closeStudentModal() {
  const backdrop = document.getElementById("studentModalBackdrop");
  backdrop.style.display = "none";
  backdrop.setAttribute("aria-hidden", "true");
}

async function saveStatus(id) {
  try {
    const btn = document.getElementById(`save-${id}`);
    const select = document.getElementById(`status-${id}`);
    if (!select) return;
    const newStatus = select.value;

    btn.disabled = true;
    btn.textContent = "Saving…";
    const res = await fetch(`${API_BASE}/student/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showToast(data.message || "Failed to update status");
      btn.disabled = false;
      btn.textContent = "Save";
      return;
    }
    const stu = studentsCache.get(id) || {};
    stu.status = newStatus;
    studentsCache.set(id, stu);
    showToast("Status updated");
    btn.textContent = "Saved";
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "Save";
    }, 1200);
    renderTable();
  } catch (e) {
    console.error(e);
    showToast("Network error while updating");
    const btn = document.getElementById(`save-${id}`);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Save";
    }
  }
}

function AddStudent() {
  if (!departmentId) {
    alert("Missing department id");
    return;
  }

  window.location.href = `../../student/studentform.html?departmentId=${encodeURIComponent(
    departmentId
  )}`;
}

function logout() {
  alert("Logging out…");
}

document.addEventListener("input", (e) => {
  if (e.target.id === "searchInput") {
    state.q = e.target.value;
    state.page = 1;
    renderTable();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "statusFilter") {
    state.status = e.target.value;
    state.page = 1;
    renderTable();
  }
  if (e.target.id === "sortBy") {
    state.sortBy = e.target.value;
    state.page = 1;
    renderTable();
  }
  if (e.target.id === "dateFilter") {
    state.date = e.target.value;
    state.page = 1;
    renderTable();
  }
});

// Pagination events
document.getElementById("pagination").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const act = btn.getAttribute("data-act");
  if (act === "prev") {
    state.page = Math.max(1, state.page - 1);
    renderTable();
    return;
  }
  if (act === "next") {
    state.page = state.page + 1;
    renderTable();
    return;
  }
  const pg = btn.getAttribute("data-pg");
  if (pg) {
    state.page = parseInt(pg, 10) || 1;
    renderTable();
  }
});

tryFetchDepartment();
fetchStudents();

document
  .getElementById("studentModalBackdrop")
  .addEventListener("click", (e) => {
    if (e.target.id === "studentModalBackdrop") {
      closeStudentModal();
    }
  });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeStudentModal();
  }
});

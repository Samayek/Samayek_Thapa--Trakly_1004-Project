import { storage } from "./storage.js";

//Render the about Trakly view UI 
export function renderAbout() {
    const taskeventCount = storage.getTaskEvents().length;
    const transactionCount = storage.getTransactions().length;
    const budget = storage.getMonthlyBudget();

    // Core modules information for display in object format to allow for easy mapping in the UI
    const modules = [ 
        {
            icon: "bi-grid-1x2",
            title: "Dashboard",
            text: "Aggregates monthly productivity and finance insights from your source modules."
        },
        {
            icon: "bi-calendar3",
            title: "Calendar Hub",
            text: "Manages task/event planning, date filtering, and timeline visibility."
        },
        {
            icon: "bi-wallet2",
            title: "Finance Tracker",
            text: "Tracks income, expenses, categories, and monthly budget progress."
        },
        {
            icon: "bi-gear",
            title: "Settings & Backup",
            text: "Controls theme/profile and handles JSON export/import (overwrite or merge)."
        }
    ];

    // Tech stack information for display in object format to allow for easy mapping in the UI
    const techStack = [
        {
            icon: "bi-filetype-html",
            title: "HTML5",
            text: "Semantic SPA shell and module-driven page sections."
        },
        {
            icon: "bi-palette",
            title: "CSS3",
            text: "Design tokens, responsive layout, and component styling."
        },
        {
            icon: "bi-bootstrap",
            title: "Bootstrap 5",
            text: "Grid/utilities/icons/components for fast and consistent UI delivery."
        },
        {
            icon: "bi-code-slash",
            title: "Vanilla JavaScript",
            text: "Modular SPA routing and feature logic without frameworks."
        },
        {
            icon: "bi-database",
            title: "localStorage",
            text: "Offline-first persistence for tasks, events, transactions, theme, and profile."
        }
    ];

    const roadmap = [
        "Dashboard timeline-style Today Tasks layout",
        "Richer event cards in Upcoming Events",
        "Advanced backup previews and conflict strategy"
    ];

    return `
        <div class="container about-shell">
            <div class="card p-4 mb-4">
                <div class="d-flex align-items-center gap-3 mb-2">
                    <i class="bi bi-info-circle fs-2 text-primary"></i>
                    <div>
                        <h2 class="mb-0">About Trakly</h2>
                        <p class="text-muted mb-0">Personal productivity SPA project</p>
                    </div>
                </div>
                <p class="mb-0">
                    Trakly is a modular single-page application that combines planning, finance tracking,
                    and project-level productivity visibility in one local-first app.
                </p>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card p-3 h-100 text-center">
                        <i class="bi bi-list-check fs-3 text-primary mb-2"></i>
                        <h6 class="text-muted">Task/Event Items</h6>
                        <h4 class="mb-0">${taskeventCount}</h4>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3 h-100 text-center">
                        <i class="bi bi-receipt fs-3 text-primary mb-2"></i>
                        <h6 class="text-muted">Transactions</h6>
                        <h4 class="mb-0">${transactionCount}</h4>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3 h-100 text-center">
                        <i class="bi bi-piggy-bank fs-3 text-primary mb-2"></i>
                        <h6 class="text-muted">Monthly Budget</h6>
                        <h4 class="mb-0">£${Number(budget).toFixed(2)}</h4>
                    </div>
                </div>
            </div>

            <div class="card p-4 mb-4">
                <h5 class="mb-3"><i class="bi bi-box-seam me-2 text-primary"></i>Core Modules</h5>
                <div class="row g-3">
                    ${modules
                        .map(
                            (m) => `
                        <div class="col-md-6">
                            <div class="border rounded p-3 h-100">
                                <h6 class="mb-2">
                                    <i class="bi ${m.icon} me-2 text-primary"></i>${m.title}
                                </h6>
                                <p class="text-muted mb-0">${m.text}</p>
                            </div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>

            <div class="card p-4 mb-4">
                <h5 class="mb-3"><i class="bi bi-cpu me-2 text-primary"></i>Tech Stack</h5>
                <div class="row g-3">
                    ${techStack
                        .map(
                            (t) => `
                        <div class="col-md-6 col-lg-4">
                            <div class="border rounded p-3 h-100">
                                <h6 class="mb-2">
                                    <i class="bi ${t.icon} me-2 text-primary"></i>${t.title}
                                </h6>
                                <p class="text-muted mb-0">${t.text}</p>
                            </div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>

            <div class="card p-4 mb-4">
                <h5 class="mb-3"><i class="bi bi-diagram-3 me-2 text-primary"></i>Architecture</h5>
                <ul class="mb-0">
                    <li>Single entry point with SPA view routing.</li>
                    <li>Each module owns its render/setup responsibilities.</li>
                    <li>Dashboard acts as read-only aggregator of Calendar and Finance data.</li>
                    <li>Storage module centralizes persistence methods for consistency.</li>
                </ul>
            </div>

            <div class="card p-4 mb-4">
                <h5 class="mb-3"><i class="bi bi-shield-lock me-2 text-primary"></i>Privacy & Data</h5>
                <p class="mb-2">All data is stored locally in the browser via <code>localStorage</code>.</p>  <!-- <code> tag used for inline code styling -->
                <p class="mb-0">Users can export/import backup JSON files for portability and recovery.</p>
            </div>

            <div class="card p-4">
                <h5 class="mb-3"><i class="bi bi-rocket-takeoff me-2 text-primary"></i>Roadmap for Future Development</h5>
                <ul class="mb-0">
                    ${roadmap.map((item) => `<li>${item}</li>`).join("")}
                </ul>
            </div>
        </div>
    `;
}

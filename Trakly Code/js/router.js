import { renderDashboard, setupDashboard} from "./modules/dashboard.js";
import { renderCalendar, setupCalendar } from "./modules/calendar.js";
import { renderFinance, setupFinanceForm } from "./modules/finance.js";
import { renderSettings, setupSettings } from "./modules/settings.js";
import { renderAbout } from "./modules/about.js";


/* This function was used to loadview the modules  

export function loadView(viewName) {

    const container = document.getElementById("view-container"); // Main container
    
    if (!container) {
        console.error("View container not found!"); // Error handling / safety check
        return;
    }

    console.log("Loading view:", viewName); // Debug log to track which view is being loaded

    switch (viewName) {
        case "dashboard":
            container.innerHTML = renderDashboard();
            setupDashboard(); // Initialize dashboard event listeners and functionality
            break;
        case "calendar":
            container.innerHTML = renderCalendar();
            setupCalendar(); // Initialize calendar event listeners and functionality
            break;
        case "finance":
            container.innerHTML = renderFinance();
            setupFinanceForm(); // Initialize the finance form
            break;
        case "about":
            container.innerHTML = renderAbout();
            break;
        default:
            container.innerHTML = `<div class="alert alert-danger"><h2>Page not found!</h2></div>`;
            console.error("View not found!, Please check the view name:", viewName);
    }
}
*/

const routes = {
    dashboard: { render: renderDashboard, setup: setupDashboard },
    calendar: { render: renderCalendar, setup: setupCalendar },
    finance: { render: renderFinance, setup: setupFinanceForm },
    settings: { render: renderSettings, setup: setupSettings },
    about: { render: renderAbout }
};

export function loadView(viewName) {
    const container = document.getElementById("view-container");
    const route = routes[viewName];
    if (!container || !route) {
        console.error("View container or route not found!"); // Error handling / safety check
        return;
    }
    console.log("Loading view:", viewName); // Debug log to track which view is being loaded
    container.innerHTML = route.render(); // Render the view's HTML content
    if (route.setup) route.setup(); // Initialize event listeners and functionality if setup function exists
}
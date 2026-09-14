/* =========================================
   SMARTCLASS AI APP
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   DEFAULT CLASSROOMS
========================================= */

const defaultRooms = [

    {
        roomId: "B201",
        roomNumber: "B201",
        capacity: 40,
        status: "AVAILABLE",
        currentStudent: "",
        purpose: "",
        checkInTime: null,
        expectedCheckoutTime: null
    },

    {
        roomId: "B202",
        roomNumber: "B202",
        capacity: 30,
        status: "AVAILABLE",
        currentStudent: "",
        purpose: "",
        checkInTime: null,
        expectedCheckoutTime: null
    },

    {
        roomId: "B203",
        roomNumber: "B203",
        capacity: 50,
        status: "AVAILABLE",
        currentStudent: "",
        purpose: "",
        checkInTime: null,
        expectedCheckoutTime: null
    },

    {
        roomId: "B204",
        roomNumber: "B204",
        capacity: 40,
        status: "AVAILABLE",
        currentStudent: "",
        purpose: "",
        checkInTime: null,
        expectedCheckoutTime: null
    },

    {
        roomId: "B205",
        roomNumber: "B205",
        capacity: 25,
        status: "AVAILABLE",
        currentStudent: "",
        purpose: "",
        checkInTime: null,
        expectedCheckoutTime: null
    }

];


/* =========================================
   STORAGE
========================================= */

const ROOMS_KEY =
    "smartclass_app_rooms";

const HISTORY_KEY =
    "smartclass_app_history";


/* =========================================
   STATE
========================================= */

let rooms = [];

let history = [];

let selectedRoomId = null;

let checkoutRoomId = null;

let activeFilter = "ALL";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    loadData();

    renderHome();

    renderRooms();

    renderSession();

    renderHistory();

    setPredictionDefaults();

    updateTimers();

    setInterval(
        updateTimers,
        1000
    );

}


/* =========================================
   LOAD DATA
========================================= */

function loadData() {

    const savedRooms =
        localStorage.getItem(
            ROOMS_KEY
        );


    const savedHistory =
        localStorage.getItem(
            HISTORY_KEY
        );


    if (savedRooms) {

        try {

            rooms =
                JSON.parse(savedRooms);

        } catch {

            rooms =
                structuredClone(
                    defaultRooms
                );

        }

    } else {

        rooms =
            structuredClone(
                defaultRooms
            );

    }


    if (savedHistory) {

        try {

            history =
                JSON.parse(savedHistory);

        } catch {

            history = [];

        }

    }

}


/* =========================================
   SAVE DATA
========================================= */

function saveRooms() {

    localStorage.setItem(
        ROOMS_KEY,
        JSON.stringify(rooms)
    );

}


function saveHistory() {

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

}


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            pageId
        );


    if (page) {

        page.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.page ===
                pageId
            ) {

                item.classList.add(
                    "active"
                );

            }

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "homePage") {

        renderHome();

    }


    if (pageId === "roomsPage") {

        renderRooms();

    }


    if (pageId === "sessionPage") {

        renderSession();

    }


    if (pageId === "historyPage") {

        renderHistory();

    }

}


/* =========================================
   HOME
========================================= */

function renderHome() {

    const container =
        document.getElementById(
            "homeRooms"
        );


    container.innerHTML = "";


    rooms.forEach(room => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "mini-room";


        item.innerHTML = `

            <div class="mini-room-top">

                <strong>
                    ${room.roomNumber}
                </strong>

                <span
                    class="status-dot
                    ${room.status.toLowerCase()}"
                ></span>

            </div>

            <small>
                ${room.status}
                · ${room.capacity} seats
            </small>

        `;


        container.appendChild(
            item
        );

    });


    renderHomeSession();

}


/* =========================================
   HOME CURRENT SESSION
========================================= */

function renderHomeSession() {

    const container =
        document.getElementById(
            "homeSession"
        );


    const session =
        getCurrentSession();


    if (!session) {

        container.classList.add(
            "hidden"
        );

        container.innerHTML = "";

        return;

    }


    container.classList.remove(
        "hidden"
    );


    container.innerHTML = `

        <div class="section-title">

            <div>

                <span>
                    ACTIVE SESSION
                </span>

                <h2>
                    Your classroom
                </h2>

            </div>

        </div>


        <div class="session-card">

            <div class="session-status">
                ● OCCUPIED
            </div>

            <div class="session-room">
                ${session.roomNumber}
            </div>

            <div class="session-purpose">
                ${escapeHTML(session.purpose)}
            </div>

            <div
                class="session-timer"
                id="homeTimer"
            >
                ${getElapsedTime(
                    session.checkInTime
                )}
            </div>

            <button
                class="danger-button"
                onclick="openCheckout('${session.roomId}')"
            >
                CHECK OUT
            </button>

        </div>

    `;

}


/* =========================================
   ROOM LIST
========================================= */

function renderRooms() {

    const container =
        document.getElementById(
            "roomList"
        );


    container.innerHTML = "";


    const filteredRooms =
        rooms.filter(room => {

            if (
                activeFilter ===
                "ALL"
            ) {

                return true;

            }


            return room.status ===
                activeFilter;

        });


    if (
        filteredRooms.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                No classrooms found.
            </div>

        `;

        return;

    }


    filteredRooms.forEach(room => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            `room-card
             ${room.status.toLowerCase()}`;


        let action = "";


        if (
            room.status ===
            "AVAILABLE"
        ) {

            action = `

                <button
                    class="room-button checkin"
                    onclick="openCheckIn('${room.roomId}')"
                >
                    CHECK IN
                </button>

            `;

        } else {

            action = `

                <button
                    class="room-button disabled"
                    disabled
                >
                    ${room.status}
                </button>

            `;

        }


        let occupiedInfo = "";


        if (
            room.status ===
            "OCCUPIED"
        ) {

            occupiedInfo = `

                <div class="room-details">

                    <div class="detail">

                        <label>
                            Student
                        </label>

                        <span>
                            ${escapeHTML(
                                room.currentStudent
                            )}
                        </span>

                    </div>

                    <div class="detail">

                        <label>
                            Started
                        </label>

                        <span>
                            ${formatTime(
                                room.checkInTime
                            )}
                        </span>

                    </div>

                </div>

            `;

        }


        card.innerHTML = `

            <div class="room-top">

                <div class="room-info">

                    <strong>
                        ${room.roomNumber}
                    </strong>

                    <small>
                        Capacity:
                        ${room.capacity} students
                    </small>

                </div>


                <div
                    class="room-status
                    ${room.status.toLowerCase()}"
                >

                    ${room.status}

                </div>

            </div>


            ${occupiedInfo}


            ${action}

        `;


        container.appendChild(
            card
        );

    });

}


/* =========================================
   FILTER ROOMS
========================================= */

function filterRooms(
    filter,
    button
) {

    activeFilter =
        filter;


    document
        .querySelectorAll(".filter")
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    button.classList.add(
        "active"
    );


    renderRooms();

}


/* =========================================
   OPEN CHECK-IN
========================================= */

function openCheckIn(roomId) {

    const room =
        rooms.find(
            item =>
                item.roomId === roomId
        );


    if (!room) {

        return;

    }


    /*
       IMPORTANT:
       Check again before allowing
       the user to continue.
    */

    if (
        room.status !==
        "AVAILABLE"
    ) {

        showToast(
            "Sorry, this classroom is currently occupied."
        );

        renderRooms();

        return;

    }


    /*
       Prevent a student from having
       multiple active sessions.
    */

    const existingSession =
        getCurrentSession();


    if (existingSession) {

        showToast(
            `You are already using ${existingSession.roomNumber}.`
        );

        showPage(
            "sessionPage"
        );

        return;

    }


    selectedRoomId =
        roomId;


    document.getElementById(
        "checkInRoomTitle"
    ).textContent =
        room.roomNumber;


    document.getElementById(
        "checkInForm"
    ).reset();


    clearErrors();


    document
        .getElementById(
            "checkInModal"
        )
        .classList.add(
            "active"
        );

}


/* =========================================
   CLOSE CHECK-IN
========================================= */

function closeCheckIn() {

    document
        .getElementById(
            "checkInModal"
        )
        .classList.remove(
            "active"
        );


    selectedRoomId =
        null;


    clearErrors();

}


/* =========================================
   CONFIRM CHECK-IN
========================================= */

function confirmCheckIn(event) {

    event.preventDefault();


    clearErrors();


    const studentId =
        document
            .getElementById(
                "studentId"
            )
            .value
            .trim();


    const purpose =
        document
            .getElementById(
                "purpose"
            )
            .value;


    const duration =
        document
            .getElementById(
                "duration"
            )
            .value;


    let valid = true;


    /* STUDENT ID */

    if (!studentId) {

        document
            .getElementById(
                "studentError"
            )
            .textContent =
            "Student ID is required.";

        valid = false;

    }


    /* PURPOSE */

    if (!purpose) {

        document
            .getElementById(
                "purposeError"
            )
            .textContent =
            "Please select a purpose.";

        valid = false;

    }


    /* DURATION */

    if (!duration) {

        document
            .getElementById(
                "durationError"
            )
            .textContent =
            "Please select a duration.";

        valid = false;

    }


    if (!valid) {

        return;

    }


    /* FIND ROOM */

    const room =
        rooms.find(
            item =>
                item.roomId ===
                selectedRoomId
        );


    if (!room) {

        showToast(
            "Classroom not found."
        );

        return;

    }


    /*
       FINAL AVAILABILITY CHECK
    */

    if (
        room.status !==
        "AVAILABLE"
    ) {

        closeCheckIn();

        showToast(
            "Sorry, this classroom is currently occupied."
        );

        renderRooms();

        return;

    }


    /*
       PREVENT MULTIPLE ACTIVE
       SESSIONS
    */

    if (getCurrentSession()) {

        closeCheckIn();

        showToast(
            "You already have an active classroom session."
        );

        return;

    }


    const now =
        new Date();


    const minutes =
        Number(duration);


    const expectedCheckout =
        new Date(
            now.getTime()
            +
            minutes *
            60 *
            1000
        );


    /*
       UPDATE CLASSROOM
    */

    room.status =
        "OCCUPIED";


    room.currentStudent =
        studentId;


    room.purpose =
        purpose;


    room.checkInTime =
        now.toISOString();


    room.expectedCheckoutTime =
        expectedCheckout.toISOString();


    saveRooms();


    closeCheckIn();


    renderHome();

    renderRooms();

    renderSession();


    showToast(
        `${room.roomNumber} check-in successful.`
    );


    showPage(
        "sessionPage"
    );

}


/* =========================================
   GET CURRENT SESSION
========================================= */

function getCurrentSession() {

    return rooms.find(
        room =>
            room.status ===
            "OCCUPIED"
            &&
            room.currentStudent
    );

}


/* =========================================
   SESSION PAGE
========================================= */

function renderSession() {

    const container =
        document.getElementById(
            "sessionContent"
        );


    const session =
        getCurrentSession();


    if (!session) {

        container.innerHTML = `

            <div class="empty-state">

                <div
                    style="
                        font-size:30px;
                        margin-bottom:12px;
                    "
                >
                    ◷
                </div>

                <strong
                    style="
                        color:white;
                        display:block;
                        margin-bottom:7px;
                    "
                >
                    No active session
                </strong>

                Find an available classroom
                to start your session.

                <br><br>

                <button
                    class="primary-button"
                    onclick="showPage('roomsPage')"
                >
                    FIND CLASSROOM
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="session-card">

            <div class="session-status">
                ● OCCUPIED
            </div>


            <div class="session-room">
                ${session.roomNumber}
            </div>


            <div class="session-purpose">
                ${escapeHTML(
                    session.purpose
                )}
            </div>


            <div
                id="mainTimer"
                class="session-timer"
            >
                ${getElapsedTime(
                    session.checkInTime
                )}
            </div>


            <div class="session-grid">

                <div class="session-data">

                    <label>
                        Student ID
                    </label>

                    <span>
                        ${escapeHTML(
                            session.currentStudent
                        )}
                    </span>

                </div>


                <div class="session-data">

                    <label>
                        Started
                    </label>

                    <span>
                        ${formatDateTime(
                            session.checkInTime
                        )}
                    </span>

                </div>


                <div class="session-data">

                    <label>
                        Duration
                    </label>

                    <span>
                        ${getPlannedDuration(
                            session
                        )}
                    </span>

                </div>


                <div class="session-data">

                    <label>
                        Expected
                    </label>

                    <span>
                        ${formatTime(
                            session.expectedCheckoutTime
                        )}
                    </span>

                </div>

            </div>


            <button
                class="danger-button"
                style="
                    width:100%;
                    margin-top:20px;
                "
                onclick="openCheckout('${session.roomId}')"
            >
                CHECK OUT
            </button>

        </div>

    `;

}


/* =========================================
   CHECKOUT
========================================= */

function openCheckout(roomId) {

    const room =
        rooms.find(
            item =>
                item.roomId === roomId
        );


    if (!room) {

        return;

    }


    if (
        room.status !==
        "OCCUPIED"
    ) {

        return;

    }


    checkoutRoomId =
        roomId;


    document
        .getElementById(
            "checkoutMessage"
        )
        .textContent =
        `Are you sure you want to check out of ${room.roomNumber}?`;


    document
        .getElementById(
            "checkoutModal"
        )
        .classList.add(
            "active"
        );

}


/* =========================================
   CLOSE CHECKOUT
========================================= */

function closeCheckout() {

    document
        .getElementById(
            "checkoutModal"
        )
        .classList.remove(
            "active"
        );


    checkoutRoomId =
        null;

}


/* =========================================
   CONFIRM CHECKOUT
========================================= */

function confirmCheckout() {

    if (!checkoutRoomId) {

        return;

    }


    const room =
        rooms.find(
            item =>
                item.roomId ===
                checkoutRoomId
        );


    if (!room) {

        closeCheckout();

        return;

    }


    if (
        room.status !==
        "OCCUPIED"
    ) {

        closeCheckout();

        return;

    }


    const checkoutTime =
        new Date();


    const checkInTime =
        new Date(
            room.checkInTime
        );


    const totalDuration =
        checkoutTime.getTime()
        -
        checkInTime.getTime();


    /*
       CREATE HISTORY
    */

    const session = {

        roomNumber:
            room.roomNumber,

        studentId:
            room.currentStudent,

        purpose:
            room.purpose,

        checkInTime:
            room.checkInTime,

        checkOutTime:
            checkoutTime.toISOString(),

        totalDuration:
            totalDuration

    };


    history.unshift(
        session
    );


    /*
       RESET ROOM
    */

    room.status =
        "AVAILABLE";


    room.currentStudent =
        "";


    room.purpose =
        "";


    room.checkInTime =
        null;


    room.expectedCheckoutTime =
        null;


    saveRooms();

    saveHistory();


    closeCheckout();


    renderHome();

    renderRooms();

    renderSession();

    renderHistory();


    showToast(
        `${room.roomNumber} is now AVAILABLE.`
    );


    showPage(
        "homePage"
    );

}


/* =========================================
   TIMER
========================================= */

function updateTimers() {

    const session =
        getCurrentSession();


    if (!session) {

        return;

    }


    const elapsed =
        getElapsedTime(
            session.checkInTime
        );


    const mainTimer =
        document.getElementById(
            "mainTimer"
        );


    if (mainTimer) {

        mainTimer.textContent =
            elapsed;

    }


    const homeTimer =
        document.getElementById(
            "homeTimer"
        );


    if (homeTimer) {

        homeTimer.textContent =
            elapsed;

    }

}


/* =========================================
   ELAPSED TIME
========================================= */

function getElapsedTime(
    startTime
) {

    if (!startTime) {

        return "00:00:00";

    }


    const start =
        new Date(
            startTime
        );


    const now =
        new Date();


    let difference =
        now.getTime()
        -
        start.getTime();


    if (difference < 0) {

        difference = 0;

    }


    const seconds =
        Math.floor(
            difference / 1000
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remainingSeconds =
        seconds % 60;


    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;

}


function pad(number) {

    return String(
        number
    ).padStart(
        2,
        "0"
    );

}


/* =========================================
   PLANNED DURATION
========================================= */

function getPlannedDuration(
    room
) {

    if (
        !room.checkInTime ||
        !room.expectedCheckoutTime
    ) {

        return "-";

    }


    const difference =
        new Date(
            room.expectedCheckoutTime
        ).getTime()
        -
        new Date(
            room.checkInTime
        ).getTime();


    const minutes =
        Math.round(
            difference / 60000
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if (hours > 0) {

        return `${hours}h ${remaining}m`;

    }


    return `${remaining}m`;

}


/* =========================================
   HISTORY
========================================= */

function renderHistory() {

    const container =
        document.getElementById(
            "historyList"
        );


    container.innerHTML = "";


    if (
        history.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                No completed sessions yet.

            </div>

        `;

        return;

    }


    history
        .slice(0, 30)
        .forEach(session => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "history-card";


            card.innerHTML = `

                <div class="history-top">

                    <div class="history-room">
                        ${escapeHTML(
                            session.roomNumber
                        )}
                    </div>

                    <div class="history-duration">
                        ${formatDuration(
                            session.totalDuration
                        )}
                    </div>

                </div>


                <div class="history-purpose">
                    ${escapeHTML(
                        session.purpose
                    )}
                </div>


                <div class="history-time">

                    ${escapeHTML(
                        session.studentId
                    )}

                    ·

                    ${formatDateTime(
                        session.checkInTime
                    )}

                    →

                    ${formatTime(
                        session.checkOutTime
                    )}

                </div>

            `;


            container.appendChild(
                card
            );

        });

}


/* =========================================
   FORMAT DURATION
========================================= */

function formatDuration(
    milliseconds
) {

    const minutes =
        Math.floor(
            milliseconds / 60000
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if (hours > 0) {

        return `${hours}h ${remaining}m`;

    }


    return `${remaining}m`;

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    return new Date(
        dateString
    ).toLocaleTimeString(
        "en-MY",
        {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* =========================================
   FORMAT DATE + TIME
========================================= */

function formatDateTime(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    return new Date(
        dateString
    ).toLocaleString(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* =========================================
   CLEAR HISTORY
========================================= */

function clearHistory() {

    if (
        history.length ===
        0
    ) {

        showToast(
            "No history to clear."
        );

        return;

    }


    const confirmed =
        confirm(
            "Clear all classroom history?"
        );


    if (!confirmed) {

        return;

    }


    history = [];


    saveHistory();


    renderHistory();


    showToast(
        "History cleared."
    );

}


/* =========================================
   AI PREDICTION
========================================= */

function setPredictionDefaults() {

    const dateInput =
        document.getElementById(
            "predictionDate"
        );


    const timeInput =
        document.getElementById(
            "predictionTime"
        );


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;


    timeInput.value =
        "15:00";

}


/*
   IMPORTANT:

   This is currently a DEMO prediction.
   It does NOT use a trained AI model yet.

   Later, this function can send the selected
   room/date/time to your real AI backend.
*/

function runPrediction() {

    const room =
        document.getElementById(
            "predictionRoom"
        ).value;


    const date =
        document.getElementById(
            "predictionDate"
        ).value;


    const time =
        document.getElementById(
            "predictionTime"
        ).value;


    if (
        !date ||
        !time
    ) {

        showToast(
            "Please select date and time."
        );

        return;

    }


    /*
       DEMO ALGORITHM

       Gives a simulated probability based
       on the selected time.

       This will later be replaced by
       your actual AI prediction model.
    */

    const hour =
        Number(
            time.split(":")[0]
        );


    let probability;


    if (
        hour >= 8 &&
        hour <= 10
    ) {

        probability =
            58 + randomNumber(0, 15);

    }

    else if (
        hour >= 11 &&
        hour <= 14
    ) {

        probability =
            72 + randomNumber(0, 15);

    }

    else if (
        hour >= 15 &&
        hour <= 17
    ) {

        probability =
            80 + randomNumber(0, 12);

    }

    else {

        probability =
            88 + randomNumber(0, 8);

    }


    probability =
        Math.min(
            probability,
            98
        );


    let label;


    if (
        probability >= 80
    ) {

        label =
            "HIGH LIKELIHOOD";

    }

    else if (
        probability >= 60
    ) {

        label =
            "MODERATE LIKELIHOOD";

    }

    else {

        label =
            "LOW LIKELIHOOD";

    }


    const result =
        document.getElementById(
            "predictionResult"
        );


    result.classList.remove(
        "hidden"
    );


    result.innerHTML = `

        <div class="percentage">
            ${probability}%
        </div>

        <div class="result-label">
            ${label}
        </div>

        <div class="result-info">

            ${room} is predicted to have a
            ${probability}% chance of being
            available on
            ${formatPredictionDate(date)}
            at
            ${formatPredictionTime(time)}.

        </div>

    `;

}


function randomNumber(
    min,
    max
) {

    return Math.floor(
        Math.random()
        *
        (max - min + 1)
    ) + min;

}


function formatPredictionDate(
    value
) {

    return new Date(
        `${value}T00:00:00`
    ).toLocaleDateString(
        "en-MY",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function formatPredictionTime(
    value
) {

    return new Date(
        `1970-01-01T${value}`
    ).toLocaleTimeString(
        "en-MY",
        {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* =========================================
   FORM ERRORS
========================================= */

function clearErrors() {

    document.getElementById(
        "studentError"
    ).textContent = "";


    document.getElementById(
        "purposeError"
    ).textContent = "";


    document.getElementById(
        "durationError"
    ).textContent = "";

}


/* =========================================
   TOAST
========================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2800);

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   MODAL OUTSIDE CLICK
========================================= */

document
    .getElementById(
        "checkInModal"
    )
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "checkInModal"
            ) {

                closeCheckIn();

            }

        }
    );


document
    .getElementById(
        "checkoutModal"
    )
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "checkoutModal"
            ) {

                closeCheckout();

            }

        }
    );


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeCheckIn();

            closeCheckout();

        }

    }
);

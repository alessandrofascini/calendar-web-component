const sheet = new CSSStyleSheet()
sheet.replaceSync(`
.calendar {
    width: 100%;
    height: fit-content;
    background: white;   
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 1rem;
}

.mini-calendar {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
}

.month-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
    gap: 16px;
    align-self: stretch;
}

.month-pointer {
    color: #0F172A;
    font-style: normal;
    font-weight: 600;  
    font-size: 16px;
    line-height: 24px;
}

.icon {
    color: #94A3B8;
}

.icon:hover {
    cursor: pointer;
}

.capitalize {
    text-transform: capitalize;
}

.week-day {
    color: #475569;
    width: 2.5rem;
    text-align: center;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
}

.month {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    justify-items: center;
}
.ddp {
    display:flex;
    height:2.5rem;
    width:2.5rem;
    min-width:1rem;
    cursor:pointer;
    flex-direction:column;
    align-items:center;
    border-radius:9999px;
    font-size:.875rem;
    line-height:1.25rem;
}

.ddp .number {
    width: 2.5rem;
    height: 1.25rem;
    text-align: center;
    margin-top: 10px;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
}

.ddp .dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 100%;
}

.left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
}

.button-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    gap: 16px;
}
`);

const ATTRIBUTE_MONTH = "month";
const ATTRIBUTE_YEAR = "year";
const MONTH_NAMES = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre"
]

const MONDAY = 1;
const SUNDAY = 0;

function getMonthDays(year, month) {
    const res = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const firstViewDay = (() => {
        const t = new Date(firstDayOfMonth);
        while (t.getDay() !== MONDAY) {
            t.setDate(t.getDate() - 1);
        }
        return t;
    })();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastViewOfMonth = (() => {
        const t = new Date(lastDayOfMonth);
        while (t.getDay() !== SUNDAY) {
            t.setDate(t.getDate() + 1);
        }
        return t;
    })();
    while (firstViewDay.getDate() !== firstDayOfMonth.getDate()) {
        res.push({
            day: firstViewDay.getDate(),
            month: firstViewDay.getMonth(),
            year: firstViewDay.getFullYear(),
            isSelected: false,
        });
        firstViewDay.setDate(firstViewDay.getDate() + 1);
    }
    while (firstDayOfMonth.getDate() <= lastDayOfMonth.getDate() && firstDayOfMonth.getMonth() === lastDayOfMonth.getMonth()) {
        res.push({
            day: firstDayOfMonth.getDate(),
            month: firstDayOfMonth.getMonth(),
            year: firstDayOfMonth.getFullYear(),
            isSelected: false,
        });
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
    }
    if (lastDayOfMonth.getTime() !== lastViewOfMonth.getTime()) {
        while (firstDayOfMonth.getDate() <= lastViewOfMonth.getDate()) {
            res.push({
                day: firstDayOfMonth.getDate(),
                month: firstDayOfMonth.getMonth(),
                year: firstDayOfMonth.getFullYear(),
                isSelected: false,
            });
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }
    }
    return res;
}

function pl(n) {
    if (+n < 10) {
        return `0${n}`;
    }
    return `${n}`;
}

function toISODate(date) {
    const {year, month, day} = date;
    return `${year}-${pl(month)}-${pl(day)}`;
}

class DayDatePickerComponent extends HTMLElement {
    selected = (() => {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth(),
            day: today.getDate(),
            isSelected: true,
        }
    })();

    constructor() {
        super();
        console.log("constructor");
        this.shadow = this.attachShadow({
            mode: "open",
        });
        this.shadow.adoptedStyleSheets = [sheet];
    }

    connectedCallback() {

        console.log("Init del calendario");

        const m = this.getAttribute(ATTRIBUTE_MONTH);
        if (m == null) {
            this.setAttribute(ATTRIBUTE_MONTH, `${new Date().getMonth()}`);
        }
        const y = this.getAttribute(ATTRIBUTE_YEAR);
        if (y == null) {
            this.setAttribute(ATTRIBUTE_YEAR, `${new Date().getFullYear()}`)
        }
        console.log(m, y);
        this.render();

        console.log("after render");
    }

    static get observedAttributes() {
        return [ATTRIBUTE_MONTH, ATTRIBUTE_YEAR];
    }

    attributeChangedCallback(prop, oldValue, newValue) {
        this.render();
    }

    get month() {
        const currentMonth = new Date().getMonth();
        const attr = this.getAttribute(ATTRIBUTE_MONTH);
        return attr ? +attr : currentMonth;
    }

    set month(m) {
        this.setAttribute(ATTRIBUTE_MONTH, m);
    }

    get year() {
        const currentYear = new Date().getFullYear();
        const attr = this.getAttribute(ATTRIBUTE_YEAR);
        return attr ? attr : currentYear;
    }

    set year(y) {
        this.setAttribute(ATTRIBUTE_YEAR, y)
    }

    _styleFactory = () => "";
    set styleFactory(f) {
        this._styleFactory = f;
        this.render();
    }

    get styleFactory() {
        return this._styleFactory;
    }

    nextMonth() {
        const current = new Date(this.year, this.month, 1);
        current.setMonth(current.getMonth() + 1);
        this.month = current.getMonth();
        this.year = current.getFullYear();
    }

    prevMonth() {
        const current = new Date(this.year, this.month, 1);
        current.setMonth(current.getMonth() - 1);
        this.month = current.getMonth();
        this.year = current.getFullYear();
    }

    render() {
        const weekDays = ["l", "m", "m", "g", "v", "s", "d"]
            .map((w) => {
                return `<div class="week-day capitalize">${w}</div>`;
            })
            .join("");
        const monthDays = getMonthDays(this.year, this.month)
            .map((el) => {
                const isSelected = [
                    el.year === this.selected.year,
                    el.month === this.selected.month,
                    el.day === this.selected.day
                ].every(v => v);
                if(isSelected) {
                    el.isSelected = true;
                }
                return el;
            })
        const monthDaysView = monthDays
            .map(d => {
                const id = toISODate(d);
                return `<div class="ddp" style="${this._styleFactory(d) || 'color: #475569'}" id="${id}">
                            <div class="number">${d.day}</div>
                            <div class="dot"></div>
                        </div>`
            })
            .join("");
            console.log("hello");
            this.shadow.innerHTML = `<div class="calendar">
            <slot name="header" class="calendar-header"></slot> 
            <main class="mini-calendar">
                <div class="month-header">
                    <div class="left">
                        <div class="month-pointer capitalize !text-red-500">
                            ${MONTH_NAMES[this.month]} ${this.year}
                        </div>
                        <slot name="badge"></slot>
                    </div>
                    <div class="button-group">
<!--                        chevron-left-->
                        <i class="icon" id="prevMonth">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </i>
<!--                        chevron-right-->
                        <i class="icon" id="nextMonth">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </i>
                    </div>
                </div>
                <div class="month">
                    ${weekDays}
                    ${monthDaysView}
                </div>
            </main>
            <slot name="footer" class="calendar-footer"></slot>
        </div>`;
        // console.log(this.shadow);
         const prevBtn = this.shadow.querySelector("#prevMonth");
         console.log(prevBtn);
         if(prevBtn !== null) {
             prevBtn.addEventListener("click", () => {
                 this.prevMonth();
             });
         }
         const nextMonth = this.shadow.querySelector("#nextMonth");
        if (nextMonth !== null)  {
             nextMonth.addEventListener("click", () => {
                 this.nextMonth();
             });
         }
            

         monthDays.forEach(d => {
             const id = toISODate(d);
            const el = this.shadow.getElementById(id);
             el.addEventListener("click", () => {
                const event = new CustomEvent("changeSelected", {
                    detail: d,
                 }, d);
                 this.selected = {...d};
                 this.dispatchEvent(event);
                 this.render();
            });
         });
    }
}

// customElements.define("day-date-picker", DayDatePicker);
customElements.define('day-date-picker', DayDatePickerComponent);
  
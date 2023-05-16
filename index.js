import {DayDatePicker} from "./src/daydatepicker";

export function install() {
    customElements.define("day-date-picker", DayDatePicker);
}

export {
    DayDatePicker
}
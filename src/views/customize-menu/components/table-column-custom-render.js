import { h } from 'vue'

export default {
    name: "table-column-custom-render",
    props: {
        row: Object,
        column: Object,
        listExposed: Object,
        renderFn: Function
    },
    render() {
        const params = {
            row: this.row,
            column: this.column,
            isMobile: false,
            listExposed: this.listExposed,
        }
        return this.renderFn(h, params)
    }
}

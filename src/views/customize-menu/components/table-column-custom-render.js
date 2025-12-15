import { h } from 'vue'

export default {
    name: "table-column-custom-render",
    props: {
        row: Object,
        column: Object,
        listExposed: Object,
        renderFn: Function,
        openFilesDialog: Function
    },
    render() {
        const params = {
            row: this.row,
            column: this.column,
            isMobile: false,
            listExposed: this.listExposed,
        }
        const components = this.$root.$.appContext.components

        // 第 4 个参数传入 openFilesDialog，和编辑器里提示的 funcParam 对齐
        return this.renderFn(h, params, components, this.openFilesDialog)
    }
}

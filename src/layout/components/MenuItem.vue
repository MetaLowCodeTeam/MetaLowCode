<template>
  <div class="menu-item" :style="{ paddingLeft: depth > 0 ? '16px' : '0' }">
    <div
      class="item-header"
      @click="selectItem(item)"
      :class="{ 'is-active': isSelected }"
    >
      <div class="mover fl">
        <el-icon size="20" class="icon">
          <ElIconRank />
        </el-icon>
      </div>
      <div class="fl item text-ellipsis">
        <el-icon class="icon" v-if="!item.useIcon">
          <Notebook />
        </el-icon>
        <el-icon class="icon" v-else :color="item.iconColor">
          <component :is="item.useIcon" />
        </el-icon>
        {{ item.name }}
      </div>
      <div class="action-icon">
        <span
          class="icon-span add-icon mr-5"
          :class="{ 'is-disabled': !canAddChildren }"
          :title="getAddButtonTitle"
          @click.stop="canAddChildren ? addChild(item) : null"
        >
          <el-icon size="16">
            <ElIconPlus />
          </el-icon>
        </span>
        <span class="icon-span" @click.stop="deleteItem(item)">
          <el-icon size="16">
            <ElIconCloseBold />
          </el-icon>
        </span>
      </div>
    </div>
    <VueDraggableNext
      v-if="item.children && item.children.length"
      :list="item.children"
      ghost-class="ghost"
      chosen-class="chosenClass"
      animation="300"
      handle=".mover"
      group="menuItems"
    >
      <MenuItem
        v-for="(child, childIndex) in item.children"
        :key="child.guid"
        :item="child"
        :index="childIndex"
        :parent-item="item"
        :depth="depth + 1"
        :max-depth="maxDepth"
        :selected-guid="selectedGuid"
        :select-item="selectItem"
        :add-child="addChild"
        :delete-item="deleteItem"
      />
    </VueDraggableNext>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { ElIcon } from 'element-plus';
import {
  Rank as ElIconRank,
  Plus as ElIconPlus,
  CloseBold as ElIconCloseBold,
  Notebook
} from '@element-plus/icons-vue';

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
  parentItem: { type: Object, default: null },
  depth: { type: Number, default: 0 },
  maxDepth: { type: Number, default: 8 },
  selectedGuid: { type: String, default: '' },
  selectItem: { type: Function, required: true },
  addChild: { type: Function, required: true },
  deleteItem: { type: Function, required: true },
});

const isSelected = computed(() => props.selectedGuid === props.item.guid);
const canAddChildren = computed(() => {
  return props.item.type === 1 && props.depth < props.maxDepth;
});

const getAddButtonTitle = computed(() => {
  if (props.item.type !== 1) {
    return '非关联项不可添加子菜单';
  }
  if (props.depth >= props.maxDepth) {
    return `最多支持${props.maxDepth}级菜单`;
  }
  return '添加子菜单';
});
</script>

<style lang="scss" scoped>
.menu-item {
  font-size: 13px;
  color: #303030;
  text-decoration: none;
  background: none repeat scroll 0 0 #fff;
}

.item-header {
  height: 36px;
  margin-bottom: 3px;
  position: relative;
  display: flex;
  align-items: center;

  &:hover {
    .action-icon {
      display: block;
    }
  }

  &.is-active {
    background: #dedede;
  }
}

.action-icon {
  position: absolute;
  right: 10px;
  top: 10px;
  display: none;

  .icon-span {
    cursor: pointer;
    display: inline-block;
    color: #a1a1a1;
    margin-right: 5px;

    &.add-icon {
      position: relative;
      top: -1px;
    }

    &:hover {
      color: #666;
    }

    &.is-disabled {
      color: #aeb1b7;
      cursor: not-allowed;
    }
  }
}

.mover {
  width: 32px;
  height: 36px;
  line-height: 36px;
  background: var(--el-color-primary);
  text-align: center;
  color: #fff;

  .icon {
    float: left;
    margin-left: 6px;
    margin-top: 8px;
  }

  &:hover {
    cursor: move;
    background: var(--el-color-primary-light-3);
  }
}

.item {
  height: 36px;
  line-height: 36px;
  border: 1px solid #dedede;
  border-left: 0;
  width: calc(100% - 32px);
  box-sizing: border-box;
  padding: 0 10px;

  .icon {
    position: relative;
    top: 2px;
  }
}

.ghost {
  background: #fff !important;
  border: 1px dashed #999;

  .mover,
  .item {
    opacity: 0;
  }
}

.chosenClass {
  background: #fff;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fl {
  float: left;
}

.mr-5 {
  margin-right: 5px;
}
</style>

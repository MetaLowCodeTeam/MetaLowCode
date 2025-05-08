<template>
	<div class="adminui-topbar">
		<div class="left-panel">
			<el-breadcrumb separator-icon="el-icon-arrow-right" class="hidden-sm-and-down">
				<transition-group name="breadcrumb">
					<template v-for="(item,inx) in breadList" :key="inx" >
						<el-breadcrumb-item v-if="item.path!='/' &&  !item.meta.hiddenBreadcrumb" :key="item.meta.title"><el-icon class="icon" v-if="item.meta.icon"><component :is="item.meta.icon" /></el-icon>{{item.meta.title}}</el-breadcrumb-item>
					</template>
				</transition-group>
			</el-breadcrumb>
		</div>
		<div class="center-panel"></div>
		<div class="right-panel">
			<slot></slot>
		</div>
	</div>
</template>

<script>
	export default {
        props: {
            isAppManagement: {
                type: Boolean,
                default: false
            }
        },
		data() {
			return {
				breadList: []
			}
		},
		created() {
			this.getBreadcrumb();
		},
		watch: {
			$route() {
				this.getBreadcrumb();
			}
		},
		methods: {
			getBreadcrumb(){
				let matched = this.$route.meta.breadcrumb;
                if(this.isAppManagement) {
                    matched = this.$route.matched;
                    matched.forEach(item => {
                        if(item.name == 'DesignApp') {
                            item.meta.title = "开发应用(" + this.$route.query.appName + ")";
                        }
                    })
                }
				this.breadList = matched;
            
			}
		}
	}
</script>

<style scoped>
	.el-breadcrumb {margin-left: 15px;}
	.el-breadcrumb .el-breadcrumb__inner .icon {font-size: 14px;margin-right: 5px;float: left;}
	.breadcrumb-enter-active,.breadcrumb-leave-active {transition: all 0.3s;}
	.breadcrumb-enter-from,.breadcrumb-leave-active {opacity: 0;transform: translateX(20px);}
	.breadcrumb-leave-active {position: absolute;}
</style>

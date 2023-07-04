import config from "@/config"
import http from "@/utils/request"

export default {
	// token: {
	// 	url: `token`,
	// 	name: "登录获取TOKEN",
	// 	post: async function(data={}){
	// 		return await http.post(this.url, data);
	// 	}
	// },

	token: {
		url: `user/login`,
		name: "登录获取TOKEN",
		post: async function(data={}){
			return await http.post(this.url, data);
		}
	}
}

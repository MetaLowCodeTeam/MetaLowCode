import config from "@/config"
import http from "@/utils/request"

export default {
	// token: {
	// 	url: `${config.API_URL}/token`,
	// 	name: "登录获取TOKEN",
	// 	post: async function(data={}){
	// 		return await http.post(this.url, data);
	// 	}
	// },

	token: {
		url: `${config.SERVER_API_URL}/user/login`,
		name: "登录获取TOKEN",
		post: async function(data={}){
			return await http.post(this.url, data);
		}
	}
}

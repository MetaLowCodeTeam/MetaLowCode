export const formFieldMapping = {
	'Boolean': {
		type: 'radio',
		options: {

		}
	},

	'Text': {
		type: 'input',
		options: {

		}
	},

	'Email': {
		type: 'input',
		options: {

		}
	},

	'Url': {
		type: 'input',
		options: {

		}
	},

	'Password': {
		type: 'input',
		options: {
			type: 'password',
			showPassword: true,
		}
	},

	'TextArea': {
		type: 'textarea',
		options: {

		}
	},

	'Integer': {
		type: 'number',
		options: {
			precision: 0,
			step: 1,
			controls: true,
		}
	},

	'Decimal': {
		type: 'number',
		options: {
			precision: 2,
			controls: false,
		}
	},

	'Percent': {
		type: 'number',
		options: {
			precision: 0,
			step: 1,
			controls: true,
		}
	},

	'Money': {
		type: 'number',
		options: {
			precision: 2,
			controls: false,
		}
	},

	'Date': {
		type: 'date',
		options: {
			type: 'date',
			format: 'YYYY-MM-DD',  //日期显示格式
			valueFormat: 'YYYY-MM-DD',  //日期对象格式
		}
	},

	'DateTime': {
		type: 'date',
		options: {
			type: 'datetime',
			format: 'YYYY-MM-DD HH:mm:ss',  //日期显示格式
			valueFormat: 'YYYY-MM-DD HH:mm:ss',  //日期对象格式
		}
	},

	'Option': {
		type: 'select',
		options: {
			multiple: false,
		}
	},

	'MultiOption': {
		type: 'select',
		options: {
			multiple: true,
		}
	},

	'Status': {
		type: 'select',
		options: {
			disabled: true,
		}
	},

	'Tag': {
		type: 'check-tag',
		options: {

		}
	},

	'Picture': {
		type: 'picture-upload',
		options: {
			uploadURL: '/picture',
			withCredentials: true,
		}
	},

	'File': {
		type: 'file-upload',
		options: {
			uploadURL: '/file',
			withCredentials: true,
		}
	},

	'Reference': {
		type: 'reference',
		options: {

		}
	},

	'AnyReference': {
		type: 'any-reference',
		options: {

		}
	},

	'ReferenceList': {
		type: 'reference-list',
		options: {

		}
	},

}

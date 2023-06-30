
export const generateId = function() {
  return Math.floor(Math.random() * 10000 + Math.random() * 5000);
};

export const copyObj = function(obj1, obj2) {  /* 浅拷贝对象属性 */
  for (let prop in obj1) {
    if (obj1.hasOwnProperty(prop)) {
      obj1[prop] = obj2[prop]
    }
  }
}

export function copyNew(oldObj) {  /* 深拷贝对象属性 */
  return JSON.parse( JSON.stringify(oldObj) )
}

export const overwriteObj = function(obj1, obj2) {  /* 浅拷贝对象属性，obj2覆盖obj1 */
  for (let prop in obj2) {
    if (obj2.hasOwnProperty(prop)) {
      obj1[prop] = obj2[prop]
    }
  }
}

export function formatRefColumn(row, column, cellValue, index) {
  let columnName = column.property
  if (!!row[columnName] && (!!(row[columnName].name))) {
    //TODO: 是否需要添加超链接？？
    return row[columnName].name
  } else {
    return ""
  }
}

export function formatRefListColumn(row, column, cellValue, index) {
  let columnName = column.property
  if (!!row[columnName] && (row[columnName].size() > 0)) {
    let columnValue = ''
    row[columnName].forEach( idName => {
      cellValue += idName.name + ', '
    })
    return columnValue
  } else {
    return ""
  }
}

export function formatOptionColumn(row, column, cellValue, index) {
  let columnName = column.property
  if (!!row[columnName] && (!!(row[columnName].label))) {
    return row[columnName].label
  } else {
    return ""
  }
}

/*
export function formatTagColumn(row, column, cellValue, index) {
  //格式化显示tag标记
  //console.log(row[column.property])
  return row[column.property]
}
*/

export function formatPercentColumn(row, column, cellValue, index) {
  //格式化显示Percent字段
  let columnName = column.property
  if (!!row[columnName]) {
    return row[columnName] + '%'
  } else {
    return ""
  }
}

export function formatBooleanColumn(row, column, cellValue, index) {
  return !!cellValue ? '是' : '-' /* TODO: 需要考虑null值的显示 */
}

export function setColumnFormatter(columnObj) {
  if (columnObj.type === 'Reference') {
    columnObj.formatter = formatRefColumn
  } else if (columnObj.type === 'ReferenceList') {
    columnObj.formatter = formatRefListColumn
  } else if (columnObj.type === 'Option') {
    columnObj.formatter = formatOptionColumn
  } /*else if (columnObj.type === 'Tag') {
    columnObj.formatter = formatTagColumn
  } */else if (columnObj.type === 'Percent') {
    columnObj.formatter = formatPercentColumn
  } else if (columnObj.type === 'Boolean') {
    columnObj.formatter = formatBooleanColumn
  }
}

export function isDefinedNull(value) {
  return (value !== undefined) && (value === null);
}

export function isNull(value) {
  return (value === null) || (value === undefined);
}

export function isNotNull(value) {
  return (value !== null) && (value !== undefined);
}

export function isEmptyStr(str) {
  //return (str === undefined) || (!str) || (!/[^\s]/.test(str));
  return (str === undefined) || (!str && (str !==0 ) && (str !== '0')) || (!/[^\s]/.test(str));
}

export function uniqueArray(arr) {  //数组去重
  let obj = {};
  return arr.filter(function(item, index, arr){
    return obj.hasOwnProperty(typeof item + item) ? false : (obj[typeof item + item] = true)
  })
}

export function testUniqueArray() {
  let arr = [1,1,'true','true',true,true,15,15,false,false, undefined,undefined, null,null, NaN, NaN,'NaN', 0, 0, 'a', 'a',{},{}];
  console.log( uniqueArray(arr) )
}

export function arrayContain(array, obj){
  for (let i = 0; i < array.length; i++){
    if (array[i] === obj)
      return true;
  }
  return false;
}

export function strArrayToStr(array, separator) {
  if (!array || (array.length <= 0)) {
    return ''
  }

  let result = ''
  array.forEach((item, idx) => {
    result += (idx === array.length - 1) ? item : item + separator
  })
  return result
}


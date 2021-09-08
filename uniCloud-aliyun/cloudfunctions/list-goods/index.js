'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const goods = db.collection('goods')
	let goodsQueryResult = await goods.skip(0).limit(10).get()
	return {
		goodsList: goodsQueryResult.data
	}
};

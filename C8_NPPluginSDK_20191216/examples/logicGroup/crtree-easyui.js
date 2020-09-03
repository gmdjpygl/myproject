var t = CRTree = {
	version: "v1.0.1",
	
	time: "v2014.06.19",
	
	// 记录所有的资源信息
	lgResource: new NPPUtils.Hash(),
	// 记录所有的资源树EasyUI对象
	lgObjects: {},
	
	/*
	---
	params: 
		- options
		{
			container(dom or dom ID)
		}
	returns:
		- succ T(tree entity, the same as next..)
		- error false
	...
	*/
	CreateLogicGroup: function (options) {
		try {
			var options = options || {};
			if (!options.connectId || !NPPILY.Connections.get(options.connectId)) {
				return false;
			}
			var _connStruct = NPPILY.Connections.get(options.connectId);
			if (_connStruct.connType != NPPILY.Enum.ConnectionType.Server) {
				return false;
			}
			
			if (options.container) {
				options.container = typeof options.container == "string" ? $("#" + options.container)[0] : options.container;
				
				options.checked = options.checkbox ? (options.checked ? true : false) : false;
				
				var _connStruct = NPPILY.Connections.get(options.connectId);
				
				var data = {
					id: options.rootID || (options.connectId + "-root"),
					text: options.rootText || _connStruct.systemName || "NVS",
					iconCls: "root",
					type: "root",
					connectId: options.connectId,
					attributes: options,
					checked: options.checked,
					children: []
				};
				
				if (!CRTree.lgResource.get(options.connectId)) {
					CRTree.lgResource.set(options.connectId, new NPPUtils.Hash());
				}
				else {
					CRTree.RemoveLogicGroupTree(options.container, options.connectId);
				}
				var lgResourceNode = CRTree.lgResource.get(options.connectId);
				if (lgResourceNode.keys().length <= 0) {
					var operator = NPPILY.GetLogicGroups(options.connectId);
					if (operator.rv == NrcapError.NRCAP_SUCCESS && operator.response) {
						$.each(operator.response, function (index, item) {
							lgResourceNode.set(
								item.index, {
									logicGroupIndex: item.index,
									name: item.name,
									original: item,
									nodes: new NPPUtils.Hash(),
									resource: new NPPUtils.Hash()
								}
							);
						});
					}
				}
				lgResourceNode.each(function (item) {
					var original = item.value.original;
					data.children.push({
						id: options.connectId + "-logic_group_" + original.index,
						text: original.name,
						iconCls: "stationmodel_collapse",
						state: "closed",
						type: "lg",
						connectId: options.connectId,
						checked: options.checked,
						attributes: original
					});
				});
				
				var T = CRTree.GetLogicGroupTreeObject(options.container);
				if (!T) {
					var T = $(options.container).tree({
						lines: typeof options.lines == "undefined" || options.lines ? true : false,
						checkbox: options.checkbox ? true : false,
						animate: typeof options.animate == "undefined" || options.animate ? true : false,
						data: [data],
						onClick: function (node) {
							// 获取子节点及资源
							CRTree.CreateLogicGroupNodeResource(T, node);
							
							if (typeof options.click == "function") {
								options.click.call(options.click, node);
							}
						},
						onDblClick: function (node) {
							if (typeof options.dblclick == "function") {
								options.dblclick.call(options.dblclick, node);
							}
						},
						onBeforeCheck: options.beforecheck || function () {},
						onCheck: options.check || function () {},
						onBeforeExpand: function (node) {
							if (node.needRefreshing !== false) {
								// 获取子节点及资源
								CRTree.CreateLogicGroupNodeResource(T, node);
							}
						},
						onExpand: function (node) {
							if (node.type == "lg") {
								T.tree("update", {
									target: node.target,
									iconCls: "stationmodel_expand"
								});
							}
						},
						onCollapse: function (node) {
							if (node.type == "lg") {
								T.tree("update", {
									target: node.target,
									iconCls: "stationmodel_collapse"
								});
							}
						}
					});
					
					CRTree.lgObjects[options.container] = T;
				}
				else {
					// 已经存在了
					var roots = T.tree("getRoots");
					if (roots.length <= 0) {
						T.tree("loadData", (data || {}));
					}
					else {
						var last = roots[roots.length - 1];
						T.tree("insert", {
							after: last.target, 
							data: (data || {})
						});
					}
				}
				return T;
			} 
		}
		catch (e) {
		}
	},
	
	CreateLogicGroupNodeResource: function (T, node) {
		try {
			if (T) {
				var connectId = node.connectId,
					type = node.type,
					logicGroupIndex = 0,
					nodeIndex = 0,
					data = [];
				
				if (type == "root" || type == "resource") {
					if (type == "root") {
						node.needRefreshing = false;
						T.tree("toggle", node.target);
					}
					return false;
				}
				
				if (connectId) {
					// 判断一下，如果已经获取过了，就展开折叠
					if (node.needRefreshing === false) {
						T.tree("toggle", node.target);
						return false;
					}
					
					if (type == "lg") {
						logicGroupIndex = node.attributes.index;
					}
					else if (type == "node") {
						logicGroupIndex = node.logicGroupIndex || 0;
						nodeIndex = (node.attributes.index || 0)
					}　
					
					var lgNode = CRTree.lgResource.get(connectId).get(logicGroupIndex);
					
					// 获取逻辑分组节点的资源（逻辑分组直接子资源应该是空的）
					var res_operator = NPPILY.GetLogicGroupResource
					(
						connectId, 
						{
							logicGroupIndex: logicGroupIndex, 
							logicGroupNodeIndex: nodeIndex
						}
					);
					if (res_operator.rv == 0 && res_operator.response) {
						$.each(res_operator.response, function (index, item) {
							var INDEX = nodeIndex + "_" + index;
							
							lgNode.resource.set(INDEX, item);
						
							var online = 0, enable = 0;
							
							// 判断设备是否在线
							var operator = NPPILY.GetResourceUsable(connectId, item.puid);
							if (operator.rv == 0) {
								online = Number(operator.response);	
							}
							// 判断设备是否使能
							var operator = NPPILY.GetResourceEnable(connectId, item.puid);
							if (operator.rv == 0) {
								enable = Number(operator.response);	
							}
							
							var clsname = "inputvideo";
							if (online == 0 || enable == 0 || item.enable == 0) {
								clsname = "inputvideo_disabled";
							}
							
							data.push({
								id: connectId + "-logic_resource_" + INDEX,
								text: item.name,
								type: "resource",
								logicGroupIndex: logicGroupIndex,
								leaf: true,
								iconCls: clsname,
								connectId: connectId,
								attributes: item
							});
						});
					}
					
					// 获取逻辑分组节点
					var node_operator = NPPILY.GetLogicGroupNodes
					(
						connectId, 
						{
							logicGroupIndex: logicGroupIndex, 
							logicGroupNodeIndex: nodeIndex
						}
					);
					// alert($.toJSON(node_operator));
					if (node_operator.rv == 0 && node_operator.response) {
						$.each(node_operator.response, function (index, item) {
							lgNode.nodes.set(item.index, item);
						
							data.push({
								id: connectId + "-logic_node_" + item.index,
								text: item.name,
								type: "node",
								logicGroupIndex: logicGroupIndex,
								leaf: false,
								iconCls: "logic",
								state: "closed",
								connectId: connectId,
								attributes: item
							});
						});
					}
				
					// 把数据塞入资源树中
					if (data.length <= 0) {
						T.tree("update", {
							target: node.target,
							data: []
						})
						data.push({
							text: '<div style="font-style:italic;white-space:nowrap;">（节点或资源为空）</div>',
							type: "resource",
							logicGroupIndex: logicGroupIndex,
							leaf: true,
							iconCls: "blank-node"
						});
					}
					// 是否需要重新获取
					node.needRefreshing = data.length <= 0 ? true : false;
					
					T.tree("append", {
						parent: node.target,
						data: data
					})
					.tree("toggle", node.target);
				}
			}
		}
		catch (e) {
		}
	},
	
	// 根据资源树容器获取资源树EasyUI对象
	GetLogicGroupTreeObject: function (container) {
		try {
			var container = typeof container == "string" ? $("#" + container)[0] : container;
			if (!container) return false;
			return CRTree.lgObjects[container] || false;
		}
		catch (e) {
		}
	},
	// 移除平台节点
	RemoveLogicGroupTree: function (container, connectId) {
		try {
			var T = CRTree.GetLogicGroupTreeObject(container);
			if (!T) return false;
			
			var roots = T.tree("getRoots");
			$.each(roots, function (index, item) {
				if (item.connectId == connectId) {
					// 移除根节点
					T.tree("remove", item.target);
				}
			});
			if (T.tree("getRoots").length <= 0) {
				delete CRTree.lgObjects[container];
			}
			return true;
		}
		catch (e) {
		}
	},	
	// 变更上下线状态
	UpdateLogicGroupTreeIconClass: function (container, connectId, puid) {
		try {
			if (!container || !connectId || !puid) return false;
			
			var online = 0, enable = 0;
								
			// 判断设备是否在线
			var operator = NPPILY.GetResourceUsable(connectId, puid);
			if (operator.rv == 0) {
				online = Number(operator.response);	
			}
			// 判断设备是否使能
			var operator = NPPILY.GetResourceEnable(connectId, puid);
			if (operator.rv == 0) {
				enable = Number(operator.response);	
			}
			
			T = CRTree.GetLogicGroupTreeObject(container);
			if (!T) return false;
			
			CRTree.lgResource.each(function (item) {
				if (item.key == connectId) {
					item.value.each(function (lg_item) {
						if (lg_item.value.resource) {
							lg_item.value.resource.each(function (res_item) {
								var res_node = res_item.value;
								if (res_node.puid == puid) {
									var clsname = "inputvideo";
									if (online == 0 || enable == 0 || res_node.enable == 0) {
										clsname = "inputvideo_disabled";
									}
									
									var node = T.tree("find", connectId + "-logic_resource_" + res_item.key);
									T.tree("update", {
										target: node.target,
										iconCls: clsname
									});
								}
							}); 
						}
					});
				}
			});
		}
		catch (e) {
		}
	},
	
	// 存储资源
	cascadeResource: new NPPUtils.Hash(),
	// 记录所有的资源树EasyUI对象
	cascadeObjects: {},
	
	// 创建设备资源树
	CreateResource: function (options) {
		try {
			var options = options || {};
			if (!options.connectId || !NPPILY.Connections.get(options.connectId)) {
				return false;
			}
			var _connStruct = NPPILY.Connections.get(options.connectId);
			 
			if (options.container) {
				options.container = typeof options.container == "string" ? $("#" + options.container)[0] : options.container;
				
				options.checked = options.checkbox ? (options.checked ? true : false) : false;
				
				var _connStruct = NPPILY.Connections.get(options.connectId);
				
				var data = {
					id: options.rootID || (options.connectId + "-root"),
					text: options.rootText || _connStruct.systemName || "NVS",
					iconCls: "root",
					type: "root",
					connectId: options.connectId,
					attributes: options,
					checked: options.checked,
					children: []
				};
				
				if (!CRTree.cascadeResource.get(options.connectId)) {
					CRTree.cascadeResource.set(options.connectId, {
						done: false,
						connectId: options.connectId,
						resource: [],
						cascade: (function () {
							var hash = new NPPUtils.Hash();
							// 是否允许列级联平台资源，默认是
							if (options.enableCascade !== false) {
								if (_connStruct.domainRoad) {
									$.each (_connStruct.domainRoad, function (index, item) {
										// 是否获取子域资源
										var done = false, resource = [];
										// 是否异步加载子域资源，默认是
										if (options.loadCascadeAsync === false) {
											resource = CRTree.PaginationForkResource(options.connectId, item);
											if (resource.length > 0) {
												done = true;
											}
										}
										hash.set(item, {name: item, done: done, resource: resource});
									});
								}
							}
							return hash;
						})()
					});
				}
				else {
					CRTree.RemoveResourceTreeRoot(options.container, options.connectId);
				}
				
				var casResNode = CRTree.cascadeResource.get(options.connectId);
				if (casResNode.done == false) {
					// 获取资源
					casResNode.resource = CRTree.PaginationForkResource(options.connectId);
					if (casResNode.resource.length > 0) {
						casResNode.done = true;
					}
				}
				if (casResNode.resource) {
					var modelType = options.modelType || [NPPILY.Enum.PuModelType.ENC, NPPILY.Enum.PuModelType.WENC];
						
					$.each(casResNode.resource, function(index, item) {
						var prefix = "station", suffix = "_disabled";
						
						if (modelType.length > 0 && $.inArray(item.modelType, modelType) == -1) {
							return true;
						}
						switch (item.modelType) {
							case NPPILY.Enum.PuModelType.ENC:
								prefix = "station";
								break;
							case NPPILY.Enum.PuModelType.WENC:
								prefix = "gateway";
								break;
							case NPPILY.Enum.PuModelType.DEC:
								prefix = "decstation";
								break;
							case NPPILY.Enum.PuModelType.WDEC:
								prefix = "";
								break;
							case NPPILY.Enum.PuModelType.CSU:
							case NPPILY.Enum.PuModelType.ESU:
								prefix = "storageUnit";
								break;
						}
						if (item.online == 1 && item.enable == 1) {
							suffix = "";
						}
						var clsname = prefix + "" + suffix;
						
						data.children.push({
							id: options.connectId + "-pu-" + item.puid,
							text: item.name,
							iconCls: clsname,
							type: "pu",
							domainRoad: "",
							connectId: options.connectId,
							attributes: item,
							checked: options.checked,
							state: "closed"
						});
					});
					if (casResNode.cascade) {
						casResNode.cascade.each(function (item) {
							if (item.key.indexOf(".") == -1) {
								data.children.push({
									id: options.connectId + "-dr-" + item.key,
									text: item.key,
									iconCls: "root",
									type: "dr",
									domainRoad: item.key,
									connectId: options.connectId,
									attributes: item.value,
									checked: options.checked,
									state: "closed"
								});
							}
						});
					}
				}
				
				var T = CRTree.GetResouceTreeObject(options.container);
				if (!T) {
					T = $(options.container).tree({
						lines: typeof options.lines == "undefined" || options.lines ? true : false,
						checkbox: options.checkbox ? true : false,
						animate: typeof options.animate == "undefined" || options.animate ? true : false,
						data: [data],
						onClick: function (node) {
							// 获取子资源
							CRTree.CreateChildNodeResource(T, node);
							
							if (typeof options.click == "function") {
								options.click.call(options.click, node);
							}
						},
						onDblClick: function (node) {
							if (typeof options.dblclick == "function") {
								options.dblclick.call(options.dblclick, node);
							}
						},
						onBeforeCheck: options.beforecheck || function () {},
						onCheck: options.check || function () {},
						onBeforeExpand: function (node) {
							if (node.needRefreshing !== false) {
								// 获取子资源
								CRTree.CreateChildNodeResource(T, node);
							}
						},
						onExpand: function (node) {
							
						},
						onCollapse: function (node) {
							
						} 
					});
				
					CRTree.cascadeObjects[options.container] = T;
				}
				else {
					// 已经存在了
					var roots = T.tree("getRoots");
					if (roots.length <= 0) {
						T.tree("loadData", (data || {}));
					}
					else {
						var last = roots[roots.length - 1];
						T.tree("insert", {
							after: last.target, 
							data: (data || {})
						});
					}
				}
				
				return T;
			}
		}
		catch (e) {
		}
	},
	// 获取子资源
	CreateChildNodeResource: function (T, node) {
		try {
			// alert($.toJSON(node));
			
			var connectId = node.connectId,
				_connStruct = NPPILY.Connections.get(connectId),
				casResNode = CRTree.cascadeResource.get(connectId),
				resource = casResNode.resource,
				cascade = casResNode.cascade;
			
			if (node.type == "root" && typeof node.needRefreshing == "undefined") {
				node.needRefreshing = false;
			}
			if (node.needRefreshing === false) {
				T.tree("toggle", node.target);
				return false;
			}
			
			switch (node.type) {
				case "dr":
					if (cascade.get(node.domainRoad)) {
						var casNode = cascade.get(node.domainRoad);
						if (casNode.done == false) {
							casNode.resource = CRTree.PaginationForkResource(connectId, node.domainRoad);
							if (casNode.resource.length > 0) {
								casNode.done = true;
							}
						}
						
						var data = [],
							modelType = [NPPILY.Enum.PuModelType.ENC, NPPILY.Enum.PuModelType.WENC];
						var root = CRTree.GetResourceTreeRoot(null, connectId);
						if (root && root.attributes) {
							modelType = root.attributes.modelType || modelType;
						}
						
						$.each(casNode.resource, function (index, item) {
							var prefix = "station", suffix = "_disabled";
							
							if (modelType.length > 0 && $.inArray(item.modelType, modelType) == -1) {
								return true;
							}
							switch (item.modelType) {
								case NPPILY.Enum.PuModelType.ENC:
									prefix = "station";
									break;
								case NPPILY.Enum.PuModelType.WENC:
									prefix = "gateway";
									break;
								case NPPILY.Enum.PuModelType.DEC:
									prefix = "decstation";
									break;
								case NPPILY.Enum.PuModelType.WDEC:
									prefix = "";
									break;
								case NPPILY.Enum.PuModelType.CSU:
								case NPPILY.Enum.PuModelType.ESU:
									prefix = "storageUnit";
									break;
							}
							if (item.online == 1 && item.enable == 1) {
								suffix = "";
							}
							var clsname = prefix + "" + suffix;
							
							data.push({
								id: connectId + "-dr_pu-" + item.puid,
								text: item.name,
								iconCls: clsname,
								type: "dr_pu",
								domainRoad: node.domainRoad,
								connectId: connectId,
								attributes: item,
								// checked: root.attributes.checked,
								checked: node.checked,
								state: "closed"
							});
						});
						
						cascade.each(function (item) {
							if (item.key.indexOf(".") != -1) {
								if (item.key.substr(item.key.indexOf(".")+1) == node.domainRoad) {
									data.push({
										id: connectId + "-dr-" + item.key,
										text: item.key.substr(0, item.key.indexOf(".")),
										iconCls: "root",
										type: "dr",
										domainRoad: item.key,
										connectId: connectId,
										attributes: item.value,
										// checked: root.attributes.checked,
										checked: node.checked,
										state: "closed"
									});
								}
							}
						});
						
						if (data.length <= 0) {
							data.push({
								text: '<div style="font-style:italic;white-space:nowrap;">（未分配资源）</div>',
								type: "none",
								leaf: true,
								iconCls: "blank-node",
								domainRoad: node.domainRoad,
								connectId: connectId
							});
						}
						
						// 是否需要重新获取
						node.needRefreshing = data.length <= 0 ? true : false;
						
						T.tree("update", {
							target: node.target,
							data: []
						}).tree("append", {
							parent: node.target,
							data: data
						})
						.tree("toggle", node.target);
					}
					break;
				case "pu":
				case "dr_pu":
					// 获取子资源
					var pu = {},
						childRes = [],
						puid = node.attributes.puid;
					if (node.type == "pu") {
						$.each(resource, function (index, item) {
							if (item.puid == puid) {
								pu = item;
								childRes = pu.childResource;
								return false;
							}
						});	
					}
					else {
						casNodeRes = cascade.get(node.domainRoad).resource;
						$.each(casNodeRes, function (index, item) {
							if (item.puid == puid) {
								pu = item;
								childRes = pu.childResource;
								return false;
							}
						});
					}
					if (childRes.length <= 0) {
						var operator = NPPILY.ForkResource
						(
							connectId,
							NPPILY.Enum.ForkResourceLevel.nppForkOnePUInfo,
							0,
							0,
							node.domainRoad,
							{
								PUID: puid
							}
						);
						if (operator.rv == NrcapError.NRCAP_SUCCESS) {
							if (typeof operator.response == "object") {
								if (operator.response.childResource.constructor != Array) {
									operator.response.childResource = [operator.response.childResource];
								}
								childRes = operator.response.childResource;
							}
						}
						// 记录到全局变量中
						pu.childResource = childRes;
					}

					var data = [],
						resType = [NPPILY.Enum.PuResourceType.VideoIn];
					
					var root = CRTree.GetResourceTreeRoot(null, connectId);
					if (root && root.attributes) {
						resType = root.attributes.resType || resType;
					}
					
					$.each(childRes, function (index, item) {
						var clsname,
							prefix = "inputvideo", 
							suffix = "_disabled";
						
						if (resType.length > 0 && $.inArray(item.type, resType) == -1) {
							return true;
						}
						
						switch (item.type) {
							case NPPILY.Enum.PuResourceType.SC:
								prefix = "storager";
								break;
							case NPPILY.Enum.PuResourceType.VideoIn:
								prefix = "inputvideo";
								break;
							case NPPILY.Enum.PuResourceType.VideoOut:
								prefix = "outputvideo";
								break;
							case NPPILY.Enum.PuResourceType.GPS:
								prefix = "gps";
								break;
							case NPPILY.Enum.PuResourceType.WIFI:
								prefix = "wifi";
								break;
							case NPPILY.Enum.PuResourceType.AudioIn:
								prefix = "inputaudio";
								break;
							case NPPILY.Enum.PuResourceType.AudioOut:
								prefix = "outputaudio";
								break;
							case NPPILY.Enum.PuResourceType.AlertIn:
								prefix = "inputdigitalline";
								break;
							case NPPILY.Enum.PuResourceType.AlertOut:
								prefix = "outputdigitalline";
								break;
							case NPPILY.Enum.PuResourceType.PTZ:
								prefix = "ptz";
								break;
							case NPPILY.Enum.PuResourceType.Storager:
								prefix = "storager";
								break;
							case NPPILY.Enum.PuResourceType.SerialPort:
								prefix = "serialport";
								break;
							case NPPILY.Enum.PuResourceType.Wireless:
								prefix = "logic";
								break;
						}
						
						if (node.attributes.online == "1" && node.attributes.enable == "1" && item.enable == "1") {
							suffix = "";
						}
						clsname = prefix + suffix;
						
						data.push({
							id: connectId + "-pures-" + puid + "-" + item.type + "-" + item.idx,
							text: item.name,
							iconCls: clsname,
							type: "pures",
							connectId: connectId,
							domainRoad: node.domainRoad,
							puid: puid,
							attributes: item,
							// checked: root.attributes.checked,
							checked: node.checked,
							leaf: true
						});
					});
					
					if (data.length <= 0) {
						data.push({
							text: '<div style="font-style:italic;white-space:nowrap;">（资源为空）</div>',
							type: "none",
							leaf: true,
							iconCls: "blank-node",
							domainRoad: node.domainRoad,
							connectId: connectId
						});
					}
					
					// 是否需要重新获取
					node.needRefreshing = data.length <= 0 ? true : false;
						
					T.tree("update", {
						target: node.target,
						data: []
					}).tree("append", {
						parent: node.target,
						data: data
					}).tree("toggle", node.target);
					break;
			} 
		}
		catch (e) {
		}
	},
	// 分页获取资源
	PaginationForkResource: function (connectId, domainRoad) {
		try {
			if (!connectId || !NPPILY.Connections.get(connectId)) {
				return [];
			}
			var _connStruct = NPPILY.Connections.get(connectId),
				domainRoad = (domainRoad || ""),
				resource = [],
				offset = 0,
				count = 300;
			
			while(true) {
				var operator = NPPILY.ForkResource
				(
					connectId,
					NPPILY.Enum.ForkResourceLevel.nppForkPUInfo,
					offset,
					count,
					domainRoad					
				);
				if (operator.rv == NrcapError.NRCAP_SUCCESS) {
					if (operator.response && $.isArray(operator.response)) {
						resource = resource.concat(operator.response);
						if (operator.response.length >= count) {
							// - 继续循环获取
							offset = offset + count;
						}
						else {
							break;
						}
					}
					else {
						break;
					}
				}
				else {
					break;
				}
			};
			
			// 进行在线排序
			var onlines = [], offlines = [];
			$.each(resource, function (index, item) {
				if (item.online == 1 && item.enable == 1) {
					onlines.push(item);
				}
				else {
					offlines.push(item);
				}
			});
			resource = [];
			resource = resource.concat(onlines);
			resource = resource.concat(offlines);
			
			return resource;
		}
		catch (e) {
			return [];
		}
	},
	// 根据资源树容器获取资源树EasyUI对象
	GetResouceTreeObject: function (container) {
		try {
			var container = typeof container == "string" ? $("#" + container)[0] : container;
			if (!container) return false;
			return CRTree.cascadeObjects[container] || false;
		}
		catch (e) {
		}
	},
	// 获取根节点
	GetResourceTreeRoot: function (container, connectId) {
		try {
			var root;
			
			var container = typeof container == "string" ? $("#" + container)[0] : container;
			
			for (var key in CRTree.cascadeObjects) {
				if (key == container || !container) {
					var T = CRTree.cascadeObjects[key];
					var roots = T.tree("getRoots");
					if (!connectId) {
						root = roots;
						break;
					}
					$.each(roots, function (index, node) {
						if (node.connectId == connectId) {
							root = node;
							return false;
						}
					});
				}
				break;
			}
			return root;
		}
		catch (e) {
		}
	},
	// 移除资源树节点
	RemoveResourceTreeRoot: function (container, connectId) {
		try {
			var T = CRTree.GetResouceTreeObject(container);
			if (!T) return false;
			
			var roots = T.tree("getRoots");
			$.each(roots, function (index, item) {
				if (item.connectId == connectId) {
					// 移除根节点
					T.tree("remove", item.target);
				}
			});
			if (T.tree("getRoots").length <= 0) {
				delete CRTree.cascadeObjects[container];
			}
			return true;
		}
		catch (e) {
		}
	},
	// 得到对应资源
	GetResourceXNodeData: function (connectId, options) {
		try {
			var rv = {
				found: false
			};
			var options = options || {};
			CRTree.cascadeResource.each(function (item) {
				if (item.key == connectId) {
					if (!options.puid && !options.domainRoad) {
						rv.found = true;
						rv.resource = item.value.resource;
						rv.cascade = item.value.cascade;
						return true;
					}
					else if (!options.puid && options.domainRoad) {
						item.value.cascade.each(function (cas_item) {
							if (cas_item.key == options.domainRoad) {
								rv.found = true;
								rv.resource = cas_item.value.resource;
								rv.domainRoad = options.domainRoad;
							}
						});
					}
					else if (options.puid) {
						$.each(item.value.resource, function (index, pu) {
							if (pu.puid == options.puid) {
								rv.found = true;
								rv.pu = pu;
								rv.domainRoad = "";
								return false;
							}
						});
						if (!rv.found) {
							item.value.cascade.each(function (cas_item) {
								$.each(cas_item.value.resource, function (index, pu) {
									if (pu.puid == options.puid) {
										rv.found = true;
										rv.pu = pu;
										rv.domainRoad = cas_item.key;
										return false;
									}
								});
								if (rv.found) return true;
							});
						}
						if (rv.found) return true;
					}
				}
			});
			return rv;
		}
		catch (e) {
			return {
				found: false
			};
		}
	},
	
	// 变更设备上下线状态
	UpdateTreeIconClass: function (connectId, puid) {
		try {
			if (!connectId || !puid) return false;
			
			var online = 0, enable = 0;
								
			// 判断设备是否在线
			var operator = NPPILY.GetResourceUsable(connectId, puid);
			if (operator.rv == 0) {
				online = Number(operator.response);	
			}
			// 判断设备是否使能
			var operator = NPPILY.GetResourceEnable(connectId, puid);
			if (operator.rv == 0) {
				enable = Number(operator.response);	
			}
			
			// 逻辑分组资源树
			for (var key in CRTree.lgObjects) {
				var T = CRTree.lgObjects[key];
				
				CRTree.lgResource.each(function (item) {
					if (item.key == connectId) {
						item.value.each(function (lg_item) {
							if (lg_item.value.resource) {
								lg_item.value.resource.each(function (res_item) {
									var res_node = res_item.value;
									if (res_node.puid == puid) {
										var clsname = "inputvideo";
										if (online == 0 || enable == 0 || res_node.enable == 0) {
											clsname = "inputvideo_disabled";
										}
										
										var node = T.tree("find", connectId + "-logic_resource_" + res_item.key);
										T.tree("update", {
											target: node.target,
											iconCls: clsname
										});
									}
								}); 
							}
						});
					}
				});
			}
			
			// 主资源树的
			var resource = CRTree.GetResourceXNodeData(connectId, {puid: puid});
				
			for (var key in CRTree.cascadeObjects) {
				var T = CRTree.cascadeObjects[key];
				
				if (resource.found == true) {
					resource.pu.online = online;
					resource.pu.enable = enable;
					
					var node = T.tree("find", connectId + "-" + (!resource.domainRoad?"pu":"dr_pu") + "-" + puid); 
					if (node) {
						var clsname = node.iconCls.replace("_disabled", "");
						if (online == 0 || enable == 0) {
							clsname += "_disabled";
						}
						T.tree("update", {
							target: node.target,
							iconCls: clsname
						});
					}
					
					// 子资源
					$.each(resource.pu.childResource, function (i, child) {
						var child_node = T.tree("find", connectId + "-pures-" + puid + "-" + child.type + "-" + child.idx);
						if (child_node) {
							var clsname = child_node.iconCls.replace("_disabled", "");
							if (online == 0 || enable == 0 || child.enable == 0) {
								clsname += "_disabled";
							}
							T.tree("update", {
								target: child_node.target,
								iconCls: clsname
							});
						}
						
					});
				};
			}
		}
		catch (e) {
		}
	},

	end: true
};
// 充电站详情和预约功能修复脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('充电站详情和预约功能修复脚本加载');
    
    // 修复充电站详情弹窗
    function fixStationDetailModal() {
        const stationDetailModal = document.getElementById('station-detail-modal');
        const closeBtn = document.getElementById('close-station-detail-modal');
        const closeBtn2 = document.getElementById('close-station-detail');
        const reserveBtn = document.getElementById('reserve-station-btn');
        const startChargingBtn = document.getElementById('start-charging-modal-btn');
        
        // 关闭按钮事件
        if (closeBtn && stationDetailModal) {
            closeBtn.addEventListener('click', function() {
                stationDetailModal.style.display = 'none';
                console.log('关闭充电站详情弹窗');
            });
        }
        
        if (closeBtn2 && stationDetailModal) {
            closeBtn2.addEventListener('click', function() {
                stationDetailModal.style.display = 'none';
                console.log('关闭充电站详情弹窗');
            });
        }
        
        // 预约按钮事件
        if (reserveBtn && stationDetailModal) {
            reserveBtn.addEventListener('click', function() {
                stationDetailModal.style.display = 'none';
                openReservationModal();
                console.log('打开预约弹窗');
            });
        }
        
        // 开始充电按钮事件
        if (startChargingBtn && stationDetailModal) {
            startChargingBtn.addEventListener('click', function() {
                stationDetailModal.style.display = 'none';
                // 切换到充电页面
                const chargingPageBtn = document.querySelector('[data-page="charging-page"]');
                if (chargingPageBtn) {
                    chargingPageBtn.click();
                } else {
                    // 备用方法
                    const chargingPage = document.getElementById('charging-page');
                    if (chargingPage) {
                        const pages = document.querySelectorAll('.page');
                        pages.forEach(page => page.classList.remove('active'));
                        chargingPage.classList.add('active');
                        
                        // 更新导航状态
                        const navItems = document.querySelectorAll('.nav-item');
                        navItems.forEach(item => item.classList.remove('active'));
                        
                        const chargingNavItem = document.querySelector('[data-page="charging-page"]');
                        if (chargingNavItem) {
                            chargingNavItem.classList.add('active');
                        }
                    }
                }
                console.log('切换到充电页面');
            });
        }
    }
    
    // 修复预约弹窗
    function fixReservationModal() {
        const reservationModal = document.getElementById('reservation-modal');
        const closeBtn = document.getElementById('close-reservation-modal');
        const cancelBtn = document.getElementById('cancel-reservation');
        const confirmBtn = document.getElementById('confirm-reservation');
        
        // 关闭按钮事件
        if (closeBtn && reservationModal) {
            closeBtn.addEventListener('click', function() {
                reservationModal.style.display = 'none';
                console.log('关闭预约弹窗');
            });
        }
        
        // 取消按钮事件
        if (cancelBtn && reservationModal) {
            cancelBtn.addEventListener('click', function() {
                reservationModal.style.display = 'none';
                console.log('取消预约');
            });
        }
        
        // 确认预约按钮事件
        if (confirmBtn && reservationModal) {
            confirmBtn.addEventListener('click', async function() {
                const date = document.getElementById('reservation-date').value;
                const time = document.getElementById('reservation-time').value;
                const duration = document.getElementById('reservation-duration').value;
                
                if (!date || !time || !duration) {
                    alert('请填写完整的预约信息');
                    return;
                }
                
                try {
                    confirmBtn.disabled = true;
                    confirmBtn.textContent = '预约中...';
                    
                    // 模拟API调用
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 预约成功
                    reservationModal.style.display = 'none';
                    alert('预约成功！');
                    
                    // 重置表单
                    document.getElementById('reservation-date').value = '';
                    document.getElementById('reservation-time').value = '';
                    document.getElementById('reservation-duration').value = '60';
                    
                    console.log('预约成功');
                } catch (error) {
                    alert('预约失败，请重试');
                    console.error('预约失败:', error);
                } finally {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = '确认预约';
                }
            });
        }
    }
    
    // 打开预约弹窗
    function openReservationModal() {
        const reservationModal = document.getElementById('reservation-modal');
        if (reservationModal) {
            reservationModal.style.display = 'flex';
            
            // 设置默认日期为今天
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('reservation-date');
            if (dateInput) {
                dateInput.value = today;
                dateInput.min = today;
            }
            
            // 设置默认时间为当前时间后1小时
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const timeInput = document.getElementById('reservation-time');
            if (timeInput) {
                timeInput.value = now.toTimeString().slice(0, 5);
            }
        }
    }
    
    // 修复充电站列表点击事件
    function fixStationListClick() {
        const stationItems = document.querySelectorAll('.station-item, .charging-station-item');
        
        console.log(`找到 ${stationItems.length} 个充电站列表项`);
        
        stationItems.forEach(item => {
            item.addEventListener('click', function() {
                const stationId = this.getAttribute('data-station-id');
                if (stationId) {
                    showStationDetailModal(stationId);
                }
            });
        });
        
        // 如果没有找到充电站列表项，创建一个示例列表
        if (stationItems.length === 0) {
            console.log('没有找到充电站列表，创建示例列表');
            createSampleStationList();
        }
    }
    
    // 创建示例充电站列表
    function createSampleStationList() {
        // 尝试找到合适的位置插入充电站列表
        const mapInfoPanel = document.querySelector('.map-info-panel');
        const mapPage = document.getElementById('map-page');
        
        if (!mapPage) return;
        
        // 创建充电站列表容器
        const stationListContainer = document.createElement('div');
        stationListContainer.className = 'station-list-container';
        stationListContainer.innerHTML = `
            <h3>附近充电站</h3>
            <div class="station-list">
                <div class="station-item" data-station-id="1">
                    <div class="station-info">
                        <h4>A区充电站</h4>
                        <p>可用: 3/5 | 快充 | ¥1.2/度</p>
                    </div>
                    <div class="station-distance">约150米</div>
                </div>
                <div class="station-item" data-station-id="2">
                    <div class="station-info">
                        <h4>B区充电站</h4>
                        <p>可用: 1/4 | 慢充 | ¥1.0/度</p>
                    </div>
                    <div class="station-distance">约300米</div>
                </div>
                <div class="station-item" data-station-id="3">
                    <div class="station-info">
                        <h4>C区充电站</h4>
                        <p>可用: 2/6 | 快充 | ¥1.5/度</p>
                    </div>
                    <div class="station-distance">约500米</div>
                </div>
            </div>
        `;
        
        // 添加基本样式
        stationListContainer.style.marginTop = '20px';
        stationListContainer.style.padding = '15px';
        stationListContainer.style.backgroundColor = '#f9f9f9';
        stationListContainer.style.borderRadius = '8px';
        
        // 添加到地图信息面板后面
        if (mapInfoPanel) {
            mapInfoPanel.parentNode.insertBefore(stationListContainer, mapInfoPanel.nextSibling);
        } else {
            // 如果没有信息面板，直接添加到地图页面内容中
            const pageContent = mapPage.querySelector('.page-content');
            if (pageContent) {
                pageContent.appendChild(stationListContainer);
            }
        }
        
        // 为新创建的列表项添加点击事件
        const newStationItems = stationListContainer.querySelectorAll('.station-item');
        newStationItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.style.padding = '10px';
            item.style.marginBottom = '10px';
            item.style.backgroundColor = 'white';
            item.style.borderRadius = '5px';
            item.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            
            item.addEventListener('click', function() {
                const stationId = this.getAttribute('data-station-id');
                if (stationId) {
                    showStationDetailModal(stationId);
                }
            });
        });
        
        console.log('创建了示例充电站列表');
    }
    
    // 显示充电站详情弹窗
    function showStationDetailModal(stationId) {
        const stationDetailModal = document.getElementById('station-detail-modal');
        const detailInfo = stationDetailModal.querySelector('.station-detail-info');
        
        if (stationDetailModal && detailInfo) {
            // 模拟充电站数据
            const stationData = {
                1: { name: 'A区充电站', address: 'A区1号楼地下停车场', available: 3, total: 5, fast: true, price: '1.2' },
                2: { name: 'B区充电站', address: 'B区2号楼地面停车场', available: 1, total: 4, fast: false, price: '1.0' },
                3: { name: 'C区充电站', address: 'C区商业区地下停车场', available: 2, total: 6, fast: true, price: '1.5' }
            };
            
            const station = stationData[stationId] || stationData[1];
            
            detailInfo.innerHTML = `
                <h4>${station.name}</h4>
                <p><strong>地址：</strong>${station.address}</p>
                <p><strong>可用桩位：</strong>${station.available}/${station.total}</p>
                <p><strong>充电类型：</strong>${station.fast ? '快充/慢充' : '仅慢充'}</p>
                <p><strong>价格：</strong>¥${station.price}/度</p>
            `;
            
            // 保存当前充电站ID到按钮上
            const reserveBtn = document.getElementById('reserve-station-btn');
            const startChargingBtn = document.getElementById('start-charging-modal-btn');
            
            if (reserveBtn) reserveBtn.setAttribute('data-station-id', stationId);
            if (startChargingBtn) startChargingBtn.setAttribute('data-station-id', stationId);
            
            stationDetailModal.style.display = 'flex';
            console.log(`显示充电站详情: ${station.name}`);
        }
    }
    
    // 修复地图上的充电站标记点击事件
    function fixMapStationMarkers() {
        // 尝试找到地图容器或地图占位符
        const mapContainer = document.getElementById('map') || document.getElementById('map-placeholder') || document.querySelector('.map-container');
        if (!mapContainer) return;
        
        console.log('找到地图容器:', mapContainer.id || mapContainer.className);
        
        // 查找地图中的充电站标记
        const stationMarkers = mapContainer.querySelectorAll('.station-marker, [data-station-id]');
        
        console.log(`地图中有 ${stationMarkers.length} 个标记`);
        
        stationMarkers.forEach(marker => {
            marker.addEventListener('click', function(e) {
                e.stopPropagation();
                const stationId = this.getAttribute('data-station-id');
                if (stationId) {
                    showStationDetailModal(stationId);
                }
            });
        });
        
        // 如果没有找到标记，创建一些示例标记用于测试
        if (stationMarkers.length === 0) {
            console.log('没有找到充电站标记，创建示例标记');
            createSampleStationMarkers(mapContainer);
        }
    }
    
    // 创建示例充电站标记
    function createSampleStationMarkers(mapContainer) {
        const sampleStations = [
            { id: 1, name: 'A区充电站', top: '20%', left: '30%' },
            { id: 2, name: 'B区充电站', top: '40%', left: '60%' },
            { id: 3, name: 'C区充电站', top: '70%', left: '45%' }
        ];
        
        sampleStations.forEach(station => {
            const marker = document.createElement('div');
            marker.className = 'station-marker';
            marker.setAttribute('data-station-id', station.id);
            marker.style.position = 'absolute';
            marker.style.top = station.top;
            marker.style.left = station.left;
            marker.style.width = '30px';
            marker.style.height = '30px';
            marker.style.backgroundColor = '#4CAF50';
            marker.style.borderRadius = '50%';
            marker.style.border = '2px solid white';
            marker.style.cursor = 'pointer';
            marker.style.zIndex = '10';
            marker.title = station.name;
            
            marker.addEventListener('click', function() {
                showStationDetailModal(station.id);
            });
            
            mapContainer.appendChild(marker);
        });
        
        console.log('创建了3个示例充电站标记');
    }
    
    // 初始化所有修复
    function initFixes() {
        fixStationDetailModal();
        fixReservationModal();
        fixStationListClick();
        fixMapStationMarkers();
        
        console.log('充电站详情和预约功能修复完成');
    }
    
    // 延迟执行修复，确保其他脚本已加载
    setTimeout(initFixes, 500);
    
    // 监听页面切换，重新绑定事件
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('page') && target.classList.contains('active')) {
                    // 页面切换后重新绑定事件
                    setTimeout(() => {
                        fixStationListClick();
                        fixMapStationMarkers();
                    }, 100);
                }
            }
        });
    });
    
    // 观察所有页面元素
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, { attributes: true });
    });
});
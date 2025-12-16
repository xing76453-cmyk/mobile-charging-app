// 界面功能增强脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('界面功能增强脚本加载');
    
    // 模拟数据
    const mockData = {
        stations: [
            { 
                id: 1, 
                name: 'A区充电站', 
                address: 'A区1号楼地下停车场', 
                available: 3, 
                total: 5, 
                fast: true, 
                distance: 150,
                price: 1.2,
                rating: 4.5,
                reviews: 128,
                waitTime: 0,
                image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=A区充电站'
            },
            { 
                id: 2, 
                name: 'B区充电站', 
                address: 'B区2号楼地面停车场', 
                available: 1, 
                total: 4, 
                fast: false, 
                distance: 300,
                price: 1.0,
                rating: 4.2,
                reviews: 86,
                waitTime: 15,
                image: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=B区充电站'
            },
            { 
                id: 3, 
                name: 'C区充电站', 
                address: 'C区商业区地下停车场', 
                available: 2, 
                total: 6, 
                fast: true, 
                distance: 500,
                price: 1.5,
                rating: 4.7,
                reviews: 203,
                waitTime: 5,
                image: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=C区充电站'
            },
            { 
                id: 4, 
                name: 'D区充电站', 
                address: 'D区科技园停车场', 
                available: 0, 
                total: 3, 
                fast: true, 
                distance: 800,
                price: 1.3,
                rating: 4.0,
                reviews: 65,
                waitTime: 30,
                image: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=D区充电站'
            },
            { 
                id: 5, 
                name: 'E区充电站', 
                address: 'E区体育中心停车场', 
                available: 4, 
                total: 7, 
                fast: true, 
                distance: 1200,
                price: 1.1,
                rating: 4.3,
                reviews: 92,
                waitTime: 0,
                image: 'https://via.placeholder.com/300x200/00BCD4/FFFFFF?text=E区充电站'
            }
        ],
        
        chargingHistory: [
            {
                id: 1,
                stationName: 'A区充电站',
                date: '2023-12-14',
                startTime: '09:30',
                endTime: '11:45',
                duration: 135,
                energy: 25.6,
                cost: 30.72,
                status: 'completed'
            },
            {
                id: 2,
                stationName: 'C区充电站',
                date: '2023-12-12',
                startTime: '14:20',
                endTime: '16:30',
                duration: 130,
                energy: 22.8,
                cost: 34.20,
                status: 'completed'
            },
            {
                id: 3,
                stationName: 'B区充电站',
                date: '2023-12-10',
                startTime: '18:00',
                endTime: '19:15',
                duration: 75,
                energy: 12.3,
                cost: 12.30,
                status: 'completed'
            }
        ],
        
        reviews: [
            {
                id: 1,
                stationId: 1,
                stationName: 'A区充电站',
                userName: '李先生',
                rating: 5,
                comment: '充电速度快，位置方便，推荐！',
                date: '2023-12-14',
                helpful: 12
            },
            {
                id: 2,
                stationId: 1,
                stationName: 'A区充电站',
                userName: '王女士',
                rating: 4,
                comment: '整体不错，就是高峰期需要排队。',
                date: '2023-12-13',
                helpful: 8
            },
            {
                id: 3,
                stationId: 2,
                stationName: 'B区充电站',
                userName: '张先生',
                rating: 3,
                comment: '位置有点偏，但价格便宜。',
                date: '2023-12-12',
                helpful: 5
            }
        ],
        
        userReservations: [
            {
                id: 'R123',
                stationId: 1,
                stationName: 'A区充电站',
                date: '2023-12-16',
                time: '14:00',
                duration: 60,
                status: 'confirmed'
            },
            {
                id: 'R124',
                stationId: 3,
                stationName: 'C区充电站',
                date: '2023-12-17',
                time: '10:00',
                duration: 90,
                status: 'pending'
            }
        ]
    };
    
    // 1. 完善首页功能
    function enhanceHomePage() {
        console.log('完善首页功能');
        
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        function performSearch() {
            const query = searchInput.value.trim();
            if (!query) return;
            
            console.log(`搜索: ${query}`);
            const results = mockData.stations.filter(station => 
                station.name.includes(query) || 
                station.address.includes(query)
            );
            
            displaySearchResults(results);
        }
        
        function displaySearchResults(results) {
            const nearbyStationsList = document.getElementById('nearby-stations-list');
            if (!nearbyStationsList) return;
            
            nearbyStationsList.innerHTML = '';
            
            if (results.length === 0) {
                nearbyStationsList.innerHTML = '<p class="no-results">未找到匹配的充电站</p>';
                return;
            }
            
            results.forEach(station => {
                const stationCard = createStationCard(station);
                nearbyStationsList.appendChild(stationCard);
            });
        }
        
        // 过滤功能
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 更新按钮状态
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                filterStations(filter);
            });
        });
        
        function filterStations(filter) {
            let filteredStations = mockData.stations;
            
            switch(filter) {
                case 'available':
                    filteredStations = mockData.stations.filter(s => s.available > 0);
                    break;
                case 'fast':
                    filteredStations = mockData.stations.filter(s => s.fast);
                    break;
            }
            
            displaySearchResults(filteredStations);
        }
        
        // 快速操作按钮
        const nearbyStationsBtn = document.getElementById('nearby-stations-btn');
        const reservationBtn = document.getElementById('reservation-btn');
        const chargingStatusBtn = document.getElementById('charging-status-btn');
        const recommendationBtn = document.getElementById('recommendation-btn');
        
        if (nearbyStationsBtn) {
            nearbyStationsBtn.addEventListener('click', function() {
                navigateToPage('map-page');
            });
        }
        
        if (reservationBtn) {
            reservationBtn.addEventListener('click', function() {
                showUserReservations();
            });
        }
        
        if (chargingStatusBtn) {
            chargingStatusBtn.addEventListener('click', function() {
                navigateToPage('charging-page');
            });
        }
        
        if (recommendationBtn) {
            recommendationBtn.addEventListener('click', function() {
                navigateToPage('recommendation-page');
            });
        }
        
        // 加载附近充电站
        loadNearbyStations();
    }
    
    function createStationCard(station) {
        const card = document.createElement('div');
        card.className = 'station-card';
        card.setAttribute('data-station-id', station.id);
        
        card.innerHTML = `
            <div class="station-header">
                <h3 class="station-name">${station.name}</h3>
                <div class="station-rating">
                    <span class="stars">${'★'.repeat(Math.floor(station.rating))}${'☆'.repeat(5-Math.floor(station.rating))}</span>
                    <span class="rating-value">${station.rating}</span>
                </div>
            </div>
            <div class="station-info">
                <p class="station-address">${station.address}</p>
                <div class="station-details">
                    <span class="station-distance">约${station.distance}米</span>
                    <span class="station-price">¥${station.price}/度</span>
                    <span class="station-type">${station.fast ? '快充' : '慢充'}</span>
                </div>
            </div>
            <div class="station-status">
                <div class="availability ${station.available > 0 ? 'available' : 'unavailable'}">
                    ${station.available > 0 ? `可用: ${station.available}/${station.total}` : '暂无空闲'}
                </div>
                ${station.waitTime > 0 ? `<span class="wait-time">等待约${station.waitTime}分钟</span>` : ''}
            </div>
            <div class="station-actions">
                <button class="primary-btn station-detail-btn" data-station-id="${station.id}">查看详情</button>
                <button class="secondary-btn station-reserve-btn" data-station-id="${station.id}">预约</button>
            </div>
        `;
        
        // 添加点击事件
        const detailBtn = card.querySelector('.station-detail-btn');
        const reserveBtn = card.querySelector('.station-reserve-btn');
        
        if (detailBtn) {
            detailBtn.addEventListener('click', function() {
                showStationDetailModal(station.id);
            });
        }
        
        if (reserveBtn) {
            reserveBtn.addEventListener('click', function() {
                openReservationModalForStation(station.id);
            });
        }
        
        return card;
    }
    
    function loadNearbyStations() {
        const nearbyStationsList = document.getElementById('nearby-stations-list');
        if (!nearbyStationsList) return;
        
        nearbyStationsList.innerHTML = '';
        
        // 按距离排序
        const sortedStations = [...mockData.stations].sort((a, b) => a.distance - b.distance);
        
        // 只显示前3个最近的
        const nearestStations = sortedStations.slice(0, 3);
        
        nearestStations.forEach(station => {
            const stationCard = createStationCard(station);
            nearbyStationsList.appendChild(stationCard);
        });
    }
    
    // 2. 完善地图页面功能
    function enhanceMapPage() {
        console.log('完善地图页面功能');
        
        // 地图控制按钮
        const locateBtn = document.getElementById('locate-btn');
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        
        if (locateBtn) {
            locateBtn.addEventListener('click', function() {
                console.log('定位到用户位置');
                // 模拟定位
                showNotification('已定位到您的位置');
            });
        }
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                console.log('放大地图');
                showNotification('地图已放大');
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                console.log('缩小地图');
                showNotification('地图已缩小');
            });
        }
        
        // 更新地图统计
        updateMapStats();
    }
    
    function updateMapStats() {
        const nearbyCount = document.getElementById('nearby-count');
        const availableCount = document.getElementById('available-count');
        
        if (nearbyCount) {
            nearbyCount.textContent = mockData.stations.length;
        }
        
        if (availableCount) {
            const totalAvailable = mockData.stations.reduce((sum, station) => sum + station.available, 0);
            availableCount.textContent = totalAvailable;
        }
    }
    
    // 3. 完善充电页面功能
    function enhanceChargingPage() {
        console.log('完善充电页面功能');
        
        const startChargingBtn = document.getElementById('start-charging-btn');
        const stopChargingBtn = document.getElementById('stop-charging-btn');
        
        console.log('找到开始充电按钮:', startChargingBtn);
        console.log('找到停止充电按钮:', stopChargingBtn);
        
        if (startChargingBtn) {
            startChargingBtn.addEventListener('click', function() {
                console.log('开始充电按钮被点击');
                startCharging();
            });
        }
        
        if (stopChargingBtn) {
            stopChargingBtn.addEventListener('click', function() {
                console.log('停止充电按钮被点击');
                stopCharging();
            });
        }
        
        // 加载充电历史
        loadChargingHistory();
    }
    
    function startCharging() {
        const startChargingBtn = document.getElementById('start-charging-btn');
        const stopChargingBtn = document.getElementById('stop-charging-btn');
        const chargingState = document.getElementById('charging-state');
        
        console.log('开始充电函数被调用');
        console.log('检查元素:', startChargingBtn, stopChargingBtn, chargingState);
        
        if (startChargingBtn && stopChargingBtn && chargingState) {
            startChargingBtn.disabled = true;
            stopChargingBtn.disabled = false;
            chargingState.textContent = '充电中';
            
            showNotification('充电已开始');
            
            // 模拟充电进度
            simulateChargingProgress();
        } else {
            console.error('无法找到必要的充电元素');
        }
    }
    
    function stopCharging() {
        const startChargingBtn = document.getElementById('start-charging-btn');
        const stopChargingBtn = document.getElementById('stop-charging-btn');
        const chargingState = document.getElementById('charging-state');
        
        console.log('停止充电函数被调用');
        
        if (startChargingBtn && stopChargingBtn && chargingState) {
            startChargingBtn.disabled = false;
            stopChargingBtn.disabled = true;
            chargingState.textContent = '充电已完成';
            
            showNotification('充电已停止');
            
            // 重置进度
            resetChargingProgress();
        }
    }
    
    let chargingInterval;
    function simulateChargingProgress() {
        let progress = 0;
        let energy = 0;
        let cost = 0;
        
        chargingInterval = setInterval(() => {
            progress += 2;
            energy += 0.5;
            cost += 0.6;
            
            if (progress > 100) {
                progress = 100;
                clearInterval(chargingInterval);
                stopCharging();
            }
            
            updateChargingProgress(progress, energy, cost);
        }, 1000);
    }
    
    function updateChargingProgress(progress, energy, cost) {
        const progressBar = document.getElementById('charging-progress');
        const progressText = document.getElementById('charging-progress-text');
        const chargedEnergy = document.getElementById('charged-energy');
        const currentCost = document.getElementById('current-cost');
        const remainingTime = document.getElementById('remaining-time');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;
        if (chargedEnergy) chargedEnergy.textContent = `${energy.toFixed(1)} kWh`;
        if (currentCost) currentCost.textContent = `¥${cost.toFixed(2)}`;
        if (remainingTime) {
            const remaining = Math.max(0, Math.ceil((100 - progress) / 2));
            remainingTime.textContent = `${remaining}分钟`;
        }
    }
    
    function resetChargingProgress() {
        updateChargingProgress(0, 0, 0);
    }
    
    function loadChargingHistory() {
        const historyList = document.getElementById('charging-history-list');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        mockData.chargingHistory.forEach(record => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <h4 class="station-name">${record.stationName}</h4>
                    <span class="history-date">${record.date}</span>
                </div>
                <div class="history-details">
                    <span class="time-range">${record.startTime} - ${record.endTime}</span>
                    <span class="duration">时长: ${record.duration}分钟</span>
                    <span class="energy">电量: ${record.energy}kWh</span>
                    <span class="cost">费用: ¥${record.cost}</span>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    // 4. 完善推荐页面功能
    function enhanceRecommendationPage() {
        console.log('完善推荐页面功能');
        
        // 保存偏好设置
        const savePreferencesBtn = document.getElementById('save-preferences-btn');
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', saveUserPreferences);
        }
        
        // 加载推荐充电站
        loadRecommendedStations();
        
        // 加载热门充电站
        loadPopularStations();
    }
    
    function saveUserPreferences() {
        const prefFastCharging = document.getElementById('pref-fast-charging');
        const prefHighAvailability = document.getElementById('pref-high-availability');
        const prefMaxDistance = document.getElementById('pref-max-distance');
        
        const preferences = {
            fastCharging: prefFastCharging ? prefFastCharging.checked : true,
            highAvailability: prefHighAvailability ? prefHighAvailability.checked : true,
            maxDistance: prefMaxDistance ? prefMaxDistance.value : '2000'
        };
        
        console.log('保存用户偏好:', preferences);
        showNotification('偏好设置已保存');
        
        // 重新加载推荐
        loadRecommendedStations(preferences);
    }
    
    function loadRecommendedStations(preferences = {}) {
        const recommendedStations = document.getElementById('recommended-stations');
        if (!recommendedStations) return;
        
        recommendedStations.innerHTML = '';
        
        // 根据偏好过滤充电站
        let filteredStations = [...mockData.stations];
        
        if (preferences.fastCharging) {
            filteredStations = filteredStations.filter(s => s.fast);
        }
        
        if (preferences.highAvailability) {
            filteredStations = filteredStations.filter(s => s.available > 0);
        }
        
        if (preferences.maxDistance) {
            const maxDistance = parseInt(preferences.maxDistance);
            filteredStations = filteredStations.filter(s => s.distance <= maxDistance);
        }
        
        // 按评分排序
        filteredStations.sort((a, b) => b.rating - a.rating);
        
        // 显示推荐充电站
        filteredStations.slice(0, 3).forEach(station => {
            const stationCard = createStationCard(station);
            recommendedStations.appendChild(stationCard);
        });
        
        if (filteredStations.length === 0) {
            recommendedStations.innerHTML = '<p class="no-results">根据您的偏好，暂无推荐的充电站</p>';
        }
    }
    
    function loadPopularStations() {
        const popularStations = document.getElementById('popular-stations');
        if (!popularStations) return;
        
        popularStations.innerHTML = '';
        
        // 按评价数量排序
        const sortedStations = [...mockData.stations].sort((a, b) => b.reviews - a.reviews);
        
        // 显示前3个热门充电站
        sortedStations.slice(0, 3).forEach(station => {
            const stationCard = createStationCard(station);
            popularStations.appendChild(stationCard);
        });
    }
    
    // 5. 完善社区页面功能
    function enhanceCommunityPage() {
        console.log('完善社区页面功能');
        
        // 初始化充电站选择器
        initStationSelector();
        
        // 初始化评价提交功能
        initReviewSubmission();
        
        // 加载评价列表
        loadReviews();
    }
    
    function initStationSelector() {
        const stationSelect = document.getElementById('review-station-select');
        if (!stationSelect) return;
        
        // 清空现有选项
        stationSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择充电站';
        stationSelect.appendChild(defaultOption);
        
        // 添加充电站选项
        mockData.stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = station.name;
            stationSelect.appendChild(option);
        });
    }
    
    function initReviewSubmission() {
        const submitReviewBtn = document.getElementById('submit-review-btn');
        if (!submitReviewBtn) return;
        
        submitReviewBtn.addEventListener('click', submitReview);
    }
    
    function submitReview() {
        const stationSelect = document.getElementById('review-station-select');
        const ratingInput = document.getElementById('review-rating');
        const commentInput = document.getElementById('review-comment');
        
        const stationId = parseInt(stationSelect.value);
        const rating = parseInt(ratingInput.value);
        const comment = commentInput.value.trim();
        
        if (!stationId || !rating || !comment) {
            showNotification('请填写完整的评价信息');
            return;
        }
        
        // 模拟提交评价
        const station = mockData.stations.find(s => s.id === stationId);
        if (station) {
            const newReview = {
                id: mockData.reviews.length + 1,
                stationId: stationId,
                stationName: station.name,
                userName: '当前用户',
                rating: rating,
                comment: comment,
                date: new Date().toISOString().split('T')[0],
                helpful: 0
            };
            
            mockData.reviews.unshift(newReview);
            
            // 清空表单
            stationSelect.value = '';
            ratingInput.value = '';
            commentInput.value = '';
            
            showNotification('评价提交成功');
            
            // 重新加载评价列表
            loadReviews();
        }
    }
    
    function loadReviews() {
        const reviewsList = document.getElementById('reviews-list');
        if (!reviewsList) return;
        
        reviewsList.innerHTML = '';
        
        mockData.reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            
            reviewCard.innerHTML = `
                <div class="review-header">
                    <div class="review-user">
                        <span class="user-name">${review.userName}</span>
                        <span class="review-date">${review.date}</span>
                    </div>
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                </div>
                <div class="review-footer">
                    <span class="station-name">${review.stationName}</span>
                    <button class="helpful-btn" data-review-id="${review.id}">
                        有用 (${review.helpful})
                    </button>
                </div>
            `;
            
            // 添加有用按钮事件
            const helpfulBtn = reviewCard.querySelector('.helpful-btn');
            if (helpfulBtn) {
                helpfulBtn.addEventListener('click', function() {
                    markReviewHelpful(review.id);
                });
            }
            
            reviewsList.appendChild(reviewCard);
        });
    }
    
    function markReviewHelpful(reviewId) {
        const review = mockData.reviews.find(r => r.id === reviewId);
        if (review) {
            review.helpful += 1;
            showNotification('感谢您的反馈');
            
            // 重新加载评价列表
            loadReviews();
        }
    }
    
    // 6. 完善个人中心页面功能
    function enhanceProfilePage() {
        console.log('完善个人中心页面功能');
        
        // 初始化编辑资料按钮
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', showEditProfileForm);
        }
        
        // 初始化保存资料按钮
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', saveUserProfile);
        }
        
        // 初始化取消编辑按钮
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', hideEditProfileForm);
        }
        
        // 加载用户预约
        loadUserReservations();
    }
    
    function showEditProfileForm() {
        const profileView = document.getElementById('profile-view');
        const profileEdit = document.getElementById('profile-edit');
        
        if (profileView) profileView.style.display = 'none';
        if (profileEdit) profileEdit.style.display = 'block';
    }
    
    function hideEditProfileForm() {
        const profileView = document.getElementById('profile-view');
        const profileEdit = document.getElementById('profile-edit');
        
        if (profileView) profileView.style.display = 'block';
        if (profileEdit) profileEdit.style.display = 'none';
    }
    
    function saveUserProfile() {
        const userName = document.getElementById('edit-username').value.trim();
        const userEmail = document.getElementById('edit-email').value.trim();
        const userPhone = document.getElementById('edit-phone').value.trim();
        const userCar = document.getElementById('edit-car').value.trim();
        
        if (!userName || !userEmail || !userPhone || !userCar) {
            showNotification('请填写完整的个人信息');
            return;
        }
        
        // 模拟保存用户信息
        console.log('保存用户信息:', { userName, userEmail, userPhone, userCar });
        
        // 更新显示的用户信息
        const displayName = document.getElementById('display-username');
        const displayEmail = document.getElementById('display-email');
        const displayPhone = document.getElementById('display-phone');
        const displayCar = document.getElementById('display-car');
        
        if (displayName) displayName.textContent = userName;
        if (displayEmail) displayEmail.textContent = userEmail;
        if (displayPhone) displayPhone.textContent = userPhone;
        if (displayCar) displayCar.textContent = userCar;
        
        showNotification('个人信息已更新');
        hideEditProfileForm();
    }
    
    function loadUserReservations() {
        const reservationsList = document.getElementById('user-reservations');
        if (!reservationsList) return;
        
        reservationsList.innerHTML = '';
        
        if (mockData.userReservations.length === 0) {
            reservationsList.innerHTML = '<p class="no-reservations">暂无预约记录</p>';
            return;
        }
        
        mockData.userReservations.forEach(reservation => {
            const reservationCard = document.createElement('div');
            reservationCard.className = 'reservation-card';
            
            const statusClass = reservation.status === 'confirmed' ? 'confirmed' : 'pending';
            const statusText = reservation.status === 'confirmed' ? '已确认' : '待确认';
            
            reservationCard.innerHTML = `
                <div class="reservation-header">
                    <h4 class="station-name">${reservation.stationName}</h4>
                    <span class="reservation-status ${statusClass}">${statusText}</span>
                </div>
                <div class="reservation-details">
                    <p><strong>预约编号:</strong> ${reservation.id}</p>
                    <p><strong>预约日期:</strong> ${reservation.date}</p>
                    <p><strong>预约时间:</strong> ${reservation.time}</p>
                    <p><strong>充电时长:</strong> ${reservation.duration}分钟</p>
                </div>
                <div class="reservation-actions">
                    ${reservation.status === 'confirmed' ? 
                        `<button class="primary-btn">导航前往</button>` : 
                        `<button class="secondary-btn cancel-btn" data-reservation-id="${reservation.id}">取消预约</button>`
                    }
                </div>
            `;
            
            // 添加取消预约按钮事件
            const cancelBtn = reservationCard.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    cancelReservation(reservation.id);
                });
            }
            
            reservationsList.appendChild(reservationCard);
        });
    }
    
    function cancelReservation(reservationId) {
        const reservationIndex = mockData.userReservations.findIndex(r => r.id === reservationId);
        if (reservationIndex !== -1) {
            mockData.userReservations.splice(reservationIndex, 1);
            showNotification('预约已取消');
            
            // 重新加载预约列表
            loadUserReservations();
        }
    }
    
    // 通用功能函数
    function showNotification(message) {
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.display = 'block';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        }
    }
    
    // 导航功能
    function navigateToPage(pageId) {
        // 隐藏所有页面
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 更新导航按钮状态
        const navButtons = document.querySelectorAll('.nav-item');
        navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-page') === pageId) {
                button.classList.add('active');
            }
        });
        
        // 根据页面调用相应的增强功能
        switch(pageId) {
            case 'home-page':
                enhanceHomePage();
                break;
            case 'map-page':
                enhanceMapPage();
                break;
            case 'charging-page':
                enhanceChargingPage();
                break;
            case 'recommendation-page':
                enhanceRecommendationPage();
                break;
            case 'community-page':
                enhanceCommunityPage();
                break;
            case 'profile-page':
                enhanceProfilePage();
                break;
        }
    }
    
    function showStationDetailModal(stationId) {
        const station = mockData.stations.find(s => s.id === parseInt(stationId));
        if (!station) return;
        
        const modal = document.getElementById('station-detail-modal');
        if (!modal) return;
        
        // 填充充电站详情
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-content');
        
        if (modalTitle) modalTitle.textContent = station.name;
        
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="station-detail">
                    <img src="${station.image}" alt="${station.name}" class="station-image">
                    <div class="station-info">
                        <p class="station-address">${station.address}</p>
                        <div class="station-stats">
                            <div class="stat-item">
                                <span class="stat-label">可用/总数:</span>
                                <span class="stat-value">${station.available}/${station.total}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">充电类型:</span>
                                <span class="stat-value">${station.fast ? '快充' : '慢充'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">价格:</span>
                                <span class="stat-value">¥${station.price}/度</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">距离:</span>
                                <span class="stat-value">约${station.distance}米</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">评分:</span>
                                <span class="stat-value">${'★'.repeat(Math.floor(station.rating))}${'☆'.repeat(5-Math.floor(station.rating))} ${station.rating}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">等待时间:</span>
                                <span class="stat-value">${station.waitTime > 0 ? `约${station.waitTime}分钟` : '无需等待'}</span>
                            </div>
                        </div>
                        <div class="station-actions">
                            ${station.available > 0 ? 
                                `<button class="primary-btn reserve-modal-btn" data-station-id="${station.id}">立即预约</button>` : 
                                '<button class="secondary-btn" disabled>暂无空闲</button>'
                            }
                            <button class="secondary-btn navigate-btn" data-station-id="${station.id}">导航前往</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加预约按钮事件
            const reserveBtn = modalContent.querySelector('.reserve-modal-btn');
            if (reserveBtn) {
                reserveBtn.addEventListener('click', function() {
                    const stationId = this.getAttribute('data-station-id');
                    hideModal('station-detail-modal');
                    openReservationModalForStation(stationId);
                });
            }
            
            // 添加导航按钮事件
            const navigateBtn = modalContent.querySelector('.navigate-btn');
            if (navigateBtn) {
                navigateBtn.addEventListener('click', function() {
                    showNotification('正在为您规划路线...');
                });
            }
        }
        
        // 显示模态框
        modal.style.display = 'flex';
    }
    
    function openReservationModalForStation(stationId) {
        const station = mockData.stations.find(s => s.id === parseInt(stationId));
        if (!station) return;
        
        const modal = document.getElementById('reservation-modal');
        if (!modal) return;
        
        // 填充预约表单
        const modalTitle = modal.querySelector('.modal-title');
        const stationInfo = modal.querySelector('.station-info');
        
        if (modalTitle) modalTitle.textContent = '预约充电站';
        
        if (stationInfo) {
            stationInfo.innerHTML = `
                <h4>${station.name}</h4>
                <p>${station.address}</p>
                <p>可用: ${station.available}/${station.total} | ${station.fast ? '快充' : '慢充'} | ¥${station.price}/度</p>
            `;
        }
        
        // 设置默认值
        const stationInput = document.getElementById('reservation-station-id');
        if (stationInput) stationInput.value = stationId;
        
        // 显示模态框
        modal.style.display = 'flex';
    }
    
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }
    
    function showUserReservations() {
        navigateToPage('profile-page');
    }
    
    // 初始化页面增强功能
    function initializeEnhancements() {
        // 获取当前活动页面
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id;
            
            // 根据页面调用相应的增强功能
            switch(pageId) {
                case 'home-page':
                    enhanceHomePage();
                    break;
                case 'map-page':
                    enhanceMapPage();
                    break;
                case 'charging-page':
                    enhanceChargingPage();
                    break;
                case 'recommendation-page':
                    enhanceRecommendationPage();
                    break;
                case 'community-page':
                    enhanceCommunityPage();
                    break;
                case 'profile-page':
                    enhanceProfilePage();
                    break;
            }
        }
    }
    
    // 模态框关闭事件
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // 点击模态框背景关闭
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // 预约表单提交
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const stationId = document.getElementById('reservation-station-id').value;
            const date = document.getElementById('reservation-date').value;
            const time = document.getElementById('reservation-time').value;
            const duration = document.getElementById('reservation-duration').value;
            
            if (!stationId || !date || !time || !duration) {
                showNotification('请填写完整的预约信息');
                return;
            }
            
            // 模拟预约提交
            const station = mockData.stations.find(s => s.id === parseInt(stationId));
            if (station) {
                const newReservation = {
                    id: 'R' + (mockData.userReservations.length + 1),
                    stationId: parseInt(stationId),
                    stationName: station.name,
                    date: date,
                    time: time,
                    duration: parseInt(duration),
                    status: 'pending'
                };
                
                mockData.userReservations.unshift(newReservation);
                
                showNotification('预约提交成功，等待确认');
                hideModal('reservation-modal');
                
                // 如果在个人中心页面，刷新预约列表
                const profilePage = document.getElementById('profile-page');
                if (profilePage && profilePage.classList.contains('active')) {
                    loadUserReservations();
                }
            }
        });
    }
    
    // 初始化
    initializeEnhancements();
});
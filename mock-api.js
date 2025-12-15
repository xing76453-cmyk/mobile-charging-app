// 模拟API服务 - 用于静态部署
class MockApiService {
    // 模拟充电站数据
    static getChargingStations() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        name: "中心广场充电站",
                        address: "市中心广场地下停车场B2层",
                        distance: 500,
                        available: 5,
                        total: 10,
                        fast: true,
                        price: 1.2,
                        rating: 4.5,
                        reviews: 128,
                        image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=充电站1"
                    },
                    {
                        id: 2,
                        name: "科技园充电站",
                        address: "高新技术产业园区A座",
                        distance: 1200,
                        available: 3,
                        total: 8,
                        fast: true,
                        price: 1.0,
                        rating: 4.2,
                        reviews: 89,
                        image: "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=充电站2"
                    },
                    {
                        id: 3,
                        name: "购物中心充电站",
                        address: "万达广场停车场3楼",
                        distance: 800,
                        available: 2,
                        total: 6,
                        fast: false,
                        price: 0.8,
                        rating: 4.0,
                        reviews: 67,
                        image: "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=充电站3"
                    },
                    {
                        id: 4,
                        name: "机场充电站",
                        address: "国际机场T2航站楼P4停车场",
                        distance: 5000,
                        available: 8,
                        total: 15,
                        fast: true,
                        price: 1.5,
                        rating: 4.7,
                        reviews: 234,
                        image: "https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=充电站4"
                    },
                    {
                        id: 5,
                        name: "火车站充电站",
                        address: "中央火车站西广场",
                        distance: 3000,
                        available: 1,
                        total: 5,
                        fast: true,
                        price: 1.1,
                        rating: 3.8,
                        reviews: 45,
                        image: "https://via.placeholder.com/300x200/F44336/FFFFFF?text=充电站5"
                    }
                ]);
            }, 300);
        });
    }

    // 模拟推荐算法
    static async getRecommendedStations(userLocation, preferences = {}) {
        const stations = await this.getChargingStations();
        
        // 设置默认偏好
        const defaultPreferences = {
            fastCharging: true,
            highAvailability: true,
            maxDistance: 2000
        };
        
        // 合并用户偏好和默认偏好
        const finalPreferences = { ...defaultPreferences, ...preferences };
        
        // 模拟基于用户位置和偏好的推荐算法
        let recommendedStations = stations.map(station => {
            // 计算距离（简化模拟）
            const distance = Math.floor(Math.random() * 2000) + 200; // 200-2200米
            
            // 如果距离超过用户最大距离，降低推荐分数
            if (distance > finalPreferences.maxDistance) {
                return {
                    ...station,
                    distance: distance,
                    recommendationScore: 0,
                    outOfRange: true
                };
            }
            
            // 计算推荐分数（基于多个因素）
            let score = 100;
            
            // 距离因素（距离越近分数越高）
            score -= Math.min(distance / 20, 50); // 最多扣50分
            
            // 可用性因素（可用桩越多分数越高）
            const availabilityRatio = station.available / station.total;
            score += availabilityRatio * 30;
            
            // 用户偏好因素
            if (finalPreferences.fastCharging && station.fast) {
                score += 20;
            }
            
            if (finalPreferences.highAvailability && station.available >= 2) {
                score += 15;
            }
            
            // 添加随机因素模拟个性化推荐（减少随机性影响）
            score += Math.random() * 5;
            
            return {
                ...station,
                distance: distance,
                recommendationScore: Math.round(score * 100) / 100,
                outOfRange: false
            };
        });
        
        // 过滤掉超出距离范围的充电站
        recommendedStations = recommendedStations.filter(station => !station.outOfRange);
        
        // 按推荐分数排序
        recommendedStations.sort((a, b) => b.recommendationScore - a.recommendationScore);
        
        // 返回前5个推荐
        return recommendedStations.slice(0, 5);
    }

    // 模拟获取热门充电站
    static async getPopularStations() {
        const stations = await this.getChargingStations();
        
        // 按评价数量排序，模拟热门程度
        const popularStations = [...stations].sort((a, b) => b.reviews - a.reviews);
        
        return popularStations.slice(0, 5);
    }

    // 模拟获取充电站详情
    static async getStationDetails(stationId) {
        const stations = await this.getChargingStations();
        const station = stations.find(s => s.id === parseInt(stationId));
        
        if (!station) {
            throw new Error('充电站不存在');
        }
        
        return {
            ...station,
            facilities: ["24小时营业", "休息室", "便利店", "维修服务"],
            operatingHours: "00:00 - 23:59",
            phone: "400-123-4567",
            description: "这是一个高质量的充电站，提供快速充电服务，设施齐全，服务周到。"
        };
    }

    // 模拟开始充电
    static async startCharging(stationId, chargingInfo) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    sessionId: "S" + Math.floor(Math.random() * 10000),
                    stationId: stationId,
                    startTime: new Date().toISOString(),
                    estimatedDuration: chargingInfo.duration || 60,
                    power: chargingInfo.power || "快充"
                });
            }, 1000);
        });
    }

    // 模拟停止充电
    static async stopCharging(sessionId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    sessionId: sessionId,
                    endTime: new Date().toISOString(),
                    duration: Math.floor(Math.random() * 120) + 30, // 30-150分钟
                    energy: (Math.random() * 50 + 10).toFixed(2), // 10-60 kWh
                    cost: (Math.random() * 100 + 20).toFixed(2) // 20-120元
                });
            }, 500);
        });
    }

    // 模拟获取充电状态
    static async getChargingStatus(sessionId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const randomProgress = Math.floor(Math.random() * 100);
                resolve({
                    sessionId: sessionId,
                    status: randomProgress >= 100 ? "completed" : "charging",
                    progress: Math.min(randomProgress, 100),
                    startTime: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(), // 0-2小时前开始
                    estimatedEndTime: new Date(Date.now() + Math.floor(Math.random() * 3600000)).toISOString(), // 0-1小时后结束
                    currentPower: (Math.random() * 50 + 20).toFixed(1), // 20-70 kW
                    totalEnergy: (Math.random() * 50 + 10).toFixed(2), // 10-60 kWh
                    cost: (Math.random() * 100 + 20).toFixed(2) // 20-120元
                });
            }, 300);
        });
    }

    // 模拟预约充电站
    static async reserveStation(stationId, reservationInfo) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    reservationId: "R" + Math.floor(Math.random() * 1000),
                    stationId: stationId,
                    reservationTime: reservationInfo.time,
                    duration: reservationInfo.duration || 60,
                    status: "confirmed"
                });
            }, 800);
        });
    }

    // 模拟获取预约列表
    static async getReservations() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = [];
                const now = new Date();
                
                // 生成一些模拟预约
                for (let i = 0; i < 3; i++) {
                    const reservationDate = new Date(now);
                    reservationDate.setDate(now.getDate() + i);
                    
                    reservations.push({
                        id: "R" + Math.floor(Math.random() * 1000),
                        stationId: Math.floor(Math.random() * 5) + 1,
                        stationName: ["中心广场充电站", "科技园充电站", "购物中心充电站"][Math.floor(Math.random() * 3)],
                        date: reservationDate.toISOString().split('T')[0],
                        time: `${Math.floor(Math.random() * 12) + 8}:00`,
                        duration: 60,
                        status: i === 0 ? "confirmed" : "pending"
                    });
                }
                
                resolve(reservations);
            }, 500);
        });
    }

    // 模拟取消预约
    static async cancelReservation(reservationId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    reservationId: reservationId,
                    status: "cancelled"
                });
            }, 400);
        });
    }

    // 模拟获取用户信息
    static async getUserInfo() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: "U123456",
                    name: "张三",
                    phone: "138****5678",
                    email: "zhang***@example.com",
                    avatar: "https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=用户",
                    memberLevel: "黄金会员",
                    registrationDate: "2023-01-15",
                    totalChargingSessions: 42,
                    totalEnergy: 1250.5,
                    totalCost: 1850.75
                });
            }, 300);
        });
    }

    // 模拟获取充电历史
    static async getChargingHistory() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const history = [];
                const now = new Date();
                
                // 生成一些模拟充电记录
                for (let i = 0; i < 10; i++) {
                    const chargingDate = new Date(now);
                    chargingDate.setDate(now.getDate() - i);
                    
                    history.push({
                        id: "S" + Math.floor(Math.random() * 10000),
                        stationId: Math.floor(Math.random() * 5) + 1,
                        stationName: ["中心广场充电站", "科技园充电站", "购物中心充电站", "机场充电站", "火车站充电站"][Math.floor(Math.random() * 5)],
                        date: chargingDate.toISOString().split('T')[0],
                        startTime: `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                        duration: Math.floor(Math.random() * 120) + 30, // 30-150分钟
                        energy: (Math.random() * 50 + 10).toFixed(2), // 10-60 kWh
                        cost: (Math.random() * 100 + 20).toFixed(2), // 20-120元
                        power: Math.random() > 0.5 ? "快充" : "慢充"
                    });
                }
                
                resolve(history);
            }, 600);
        });
    }

    // 模拟提交评价
    static async submitReview(stationId, rating, comment) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reviewId = "Rev" + Math.floor(Math.random() * 1000);
                resolve({
                    reviewId: reviewId,
                    stationId: stationId,
                    rating: rating,
                    comment: comment,
                    timestamp: new Date().toISOString(),
                    status: "Success"
                });
            }, 500);
        });
    }

    // 模拟获取充电站评价
    static async getStationReviews(stationId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reviews = [
                    {
                        id: "Rev001",
                        stationId: stationId,
                        userName: "李明",
                        rating: 5,
                        comment: "充电速度很快，设施齐全，服务态度好！",
                        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1天前
                        helpful: 12
                    },
                    {
                        id: "Rev002",
                        stationId: stationId,
                        userName: "王芳",
                        rating: 4,
                        comment: "整体不错，就是高峰期需要排队。",
                        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2天前
                        helpful: 8
                    },
                    {
                        id: "Rev003",
                        stationId: stationId,
                        userName: "张伟",
                        rating: 5,
                        comment: "位置方便，充电桩数量多，推荐！",
                        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3天前
                        helpful: 6
                    }
                ];
                
                resolve(reviews);
            }, 400);
        });
    }

    // 模拟评价点赞
    static async markReviewHelpful(reviewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: "已标记为有用",
                    newHelpfulCount: Math.floor(Math.random() * 20) + 10
                });
            }, 200);
        });
    }
}

// 替换原有的ApiService
window.ApiService = MockApiService;
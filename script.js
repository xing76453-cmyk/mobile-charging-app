// 全局变量
let chargingStations = [];

// 添加调试代码
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
});

// 检查关键依赖
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成');
    
    // 检查ApiService是否可用
    if (typeof ApiService === 'undefined') {
        console.error('ApiService未定义，应用可能无法正常工作');
    } else {
        console.log('ApiService已定义');
    }
    
    // 检查关键元素是否存在
    const criticalElements = [
        'home-page',
        'map-page',
        'charging-page',
        'recommendation-page',
        'community-page',
        'profile-page'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`关键元素缺失: ${id}`);
        } else {
            console.log(`关键元素存在: ${id}`);
        }
    });
});

// 全局性能优化器实例
let globalOptimizer = null;

// 路由系统
class Router {
    constructor() {
        this.currentPage = null;
        this.history = [];
        this.maxHistoryLength = 10;
        this.pages = new Map();
        this.navigationItems = new Map();
        this.isTransitioning = false;
        this.transitionDuration = 300; // 匹配CSS过渡时间
    }

    // 初始化路由系统
    init() {
        console.log('Router: 初始化路由系统');
        
        // 收集所有页面和导航项
        this.collectPages();
        this.collectNavigationItems();
        
        // 设置导航事件监听
        this.setupNavigation();
        
        // 设置浏览器历史记录支持
        this.setupHistoryHandling();
        
        // 设置初始页面
        const initialPage = this.getInitialPage();
        this.navigateTo(initialPage, false);
        
        console.log(`Router: 初始化完成，当前页面: ${this.currentPage}`);
    }

    // 收集所有页面
    collectPages() {
        const pageElements = document.querySelectorAll('.page');
        pageElements.forEach(page => {
            this.pages.set(page.id, page);
        });
        console.log(`Router: 收集到 ${this.pages.size} 个页面`);
    }

    // 收集所有导航项
    collectNavigationItems() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const targetPage = item.getAttribute('data-page');
            if (targetPage) {
                this.navigationItems.set(targetPage, item);
            }
        });
        console.log(`Router: 收集到 ${this.navigationItems.size} 个导航项`);
    }

    // 设置导航事件监听
    setupNavigation() {
        this.navigationItems.forEach((navItem, pageId) => {
            // 移除之前的事件监听器
            const newNavItem = navItem.cloneNode(true);
            navItem.parentNode.replaceChild(newNavItem, navItem);
            
            // 添加新的事件监听器
            newNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigateTo(pageId);
            });
        });
    }

    // 设置浏览器历史记录支持
    setupHistoryHandling() {
        // 监听浏览器前进/后退
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });
    }

    // 获取初始页面
    getInitialPage() {
        // 检查URL hash
        const hashPage = window.location.hash.slice(1);
        if (hashPage && this.pages.has(hashPage)) {
            return hashPage;
        }
        
        // 检查历史记录状态
        if (history.state && history.state.page && this.pages.has(history.state.page)) {
            return history.state.page;
        }
        
        // 检查当前活动页面
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            return activePage.id;
        }
        
        // 默认返回第一个页面
        return this.pages.keys().next().value;
    }

    // 导航到指定页面
    navigateTo(pageId, updateHistory = true) {
        if (this.isTransitioning) {
            console.log(`Router: 正在转换中，忽略导航请求到 ${pageId}`);
            return;
        }

        if (!this.pages.has(pageId)) {
            console.error(`Router: 页面 ${pageId} 不存在`);
            return;
        }

        if (this.currentPage === pageId) {
            console.log(`Router: 已经在页面 ${pageId}，无需切换`);
            return;
        }

        console.log(`Router: 从 ${this.currentPage} 导航到 ${pageId}`);
        
        this.isTransitioning = true;
        
        // 执行页面切换
        this.switchPage(pageId);
        
        // 更新导航状态
        this.updateNavigation(pageId);
        
        // 更新历史记录
        if (updateHistory) {
            this.updateHistory(pageId);
        }
        
        // 执行页面特定的初始化
        this.initPage(pageId);
        
        // 重置转换状态
        setTimeout(() => {
            this.isTransitioning = false;
            this.currentPage = pageId;
            console.log(`Router: 页面切换完成，当前页面: ${this.currentPage}`);
        }, this.transitionDuration);
    }

    // 切换页面显示
    switchPage(pageId) {
        const currentPageElement = this.currentPage ? this.pages.get(this.currentPage) : null;
        const targetPage = this.pages.get(pageId);
        
        if (!targetPage) {
            console.error(`Router: 目标页面 ${pageId} 不存在`);
            return;
        }
        
        // 如果没有当前页面或过渡管理器不可用，使用简单切换
        if (!currentPageElement || typeof transitionManager === 'undefined') {
            // 隐藏所有页面
            this.pages.forEach((page, id) => {
                page.classList.remove('active');
            });
            
            // 显示目标页面
            targetPage.classList.add('active');
            return;
        }
        
        // 使用页面过渡动画
        try {
            // 隐藏所有页面
            this.pages.forEach((page, id) => {
                page.classList.remove('active');
            });
            
            // 显示目标页面
            targetPage.classList.add('active');
            
            // 应用过渡动画
            transitionManager.applyTransition(currentPageElement, targetPage, 'slide');
        } catch (error) {
            console.error('Router: 页面过渡动画失败，使用简单切换', error);
            
            // 降级到简单切换
            this.pages.forEach((page, id) => {
                page.classList.remove('active');
            });
            targetPage.classList.add('active');
        }
    }

    // 更新导航状态
    updateNavigation(pageId) {
        this.navigationItems.forEach((navItem, id) => {
            if (id === pageId) {
                navItem.classList.add('active');
            } else {
                navItem.classList.remove('active');
            }
        });
    }

    // 更新历史记录
    updateHistory(pageId) {
        // 添加到内部历史记录
        this.history.push(pageId);
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
        
        // 更新浏览器历史记录
        const url = `#${pageId}`;
        history.pushState({ page: pageId }, '', url);
    }

    // 页面特定的初始化
    initPage(pageId) {
        // 如果切换到状态页面，自动刷新状态
        if (pageId === 'status-page' && typeof currentTask !== 'undefined' && currentTask) {
            if (typeof updateTaskStatus === 'function') {
                updateTaskStatus();
            }
        }
        
        // 触发自定义事件
        const event = new CustomEvent('pageChanged', { detail: { pageId } });
        document.dispatchEvent(event);
    }

    // 获取当前页面
    getCurrentPage() {
        return this.currentPage;
    }

    // 获取历史记录
    getHistory() {
        return [...this.history];
    }

    // 返回上一页
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // 移除当前页面
            const previousPage = this.history[this.history.length - 1];
            this.navigateTo(previousPage, false);
        } else {
            console.log('Router: 没有历史记录可以返回');
        }
    }
}

// 创建全局路由实例
const router = new Router();

// 页面过渡动画系统
class PageTransitionManager {
    constructor() {
        this.transitionDuration = 300;
        this.activeTransition = null;
        this.transitionTypes = {
            slide: 'slide-transition',
            fade: 'fade-transition',
            scale: 'scale-transition',
            flip: 'flip-transition'
        };
    }

    // 应用页面过渡动画
    applyTransition(fromPage, toPage, transitionType = 'slide') {
        if (this.activeTransition) {
            // 如果已有活动过渡，立即完成
            clearTimeout(this.activeTransition);
            this.completeTransition();
        }

        // 添加过渡类
        const transitionClass = this.transitionTypes[transitionType] || this.transitionTypes.slide;
        
        // 设置初始状态
        fromPage.classList.add('page-exit-active');
        fromPage.classList.add(`${transitionClass}-exit`);
        
        toPage.classList.add('page-enter-active');
        toPage.classList.add(`${transitionClass}-enter`);
        
        // 触发重排以确保过渡类生效
        void toPage.offsetWidth;
        
        // 应用过渡状态
        fromPage.classList.add(`${transitionClass}-exit-active`);
        toPage.classList.add(`${transitionClass}-enter-active`);
        
        // 设置过渡完成回调
        this.activeTransition = setTimeout(() => {
            this.completeTransition(fromPage, toPage, transitionClass);
        }, this.transitionDuration);
    }

    // 完成过渡
    completeTransition(fromPage, toPage, transitionClass) {
        // 清除所有过渡类
        if (fromPage) {
            fromPage.classList.remove(
                'page-exit-active',
                `${transitionClass}-exit`,
                `${transitionClass}-exit-active`
            );
        }
        
        if (toPage) {
            toPage.classList.remove(
                'page-enter-active',
                `${transitionClass}-enter`,
                `${transitionClass}-enter-active`
            );
        }
        
        this.activeTransition = null;
    }

    // 设置过渡持续时间
    setDuration(duration) {
        this.transitionDuration = duration;
    }

    // 获取可用的过渡类型
    getAvailableTransitions() {
        return Object.keys(this.transitionTypes);
    }
}

// 创建全局页面过渡管理器实例
const transitionManager = new PageTransitionManager();

// 模拟API服务
class ApiService {
    static async requestCharge(location) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 返回模拟的任务数据
        return {
            taskId: "T" + Math.floor(Math.random() * 1000),
            status: "Waiting",
            progress: 0.0,
            location: location
        };
    }
    
    // 新增：带参数的充电请求方法
    static async requestChargeWithParams(location, vehicle, chargeType) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // 根据充电类型计算预计完成时间
        const estimatedTime = chargeType === 'fast' ? 30 : 120; // 分钟
        
        // 返回模拟的任务数据
        return {
            taskId: "T" + Math.floor(Math.random() * 1000),
            status: "Waiting",
            progress: 0.0,
            location: location,
            vehicle: vehicle,
            chargeType: chargeType,
            estimatedTime: estimatedTime,
            startTime: new Date().toISOString()
        };
    }

    static async getTaskStatus(taskId) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟不同的状态和进度
        const randomProgress = Math.random();
        let status;
        
        if (randomProgress < 0.2) {
            status = "Waiting";
        } else if (randomProgress < 0.8) {
            status = "Charging";
        } else {
            status = "Completed";
        }
        
        return {
            taskId: taskId,
            status: status,
            progress: randomProgress
        };
    }
    
    // 获取充电站列表
    static async getChargingStations() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return [
            { 
                id: 1, 
                name: 'A区充电站', 
                available: 3, 
                total: 5, 
                fast: true, 
                lat: 30.30, 
                lng: 120.25, 
                address: 'A区1号楼地下停车场',
                distance: '约150米',
                estimatedTime: '约5分钟',
                alternativeTime: '约8分钟',
                alternativeDistance: '约200米',
                trafficStatus: '畅通',
                type: 'fast',
                price: '¥1.2/度',
                description: '位于A区1号楼地下停车场，配备直流快充桩',
                facilities: ['restroom', 'shop'],
                rating: 4.5,
                reviews: 128
            },
            { 
                id: 2, 
                name: 'B区充电站', 
                available: 1, 
                total: 4, 
                fast: false, 
                lat: 30.50, 
                lng: 120.60, 
                address: 'B区2号楼地面停车场',
                distance: '约300米',
                estimatedTime: '约10分钟',
                alternativeTime: '约12分钟',
                alternativeDistance: '约350米',
                trafficStatus: '轻度拥堵',
                type: 'slow',
                price: '¥0.8/度',
                description: '位于B区2号楼地面停车场，配备交流慢充桩',
                facilities: ['shop'],
                rating: 4.2,
                reviews: 86
            },
            { 
                id: 3, 
                name: 'C区充电站', 
                available: 5, 
                total: 5, 
                fast: true, 
                lat: 30.70, 
                lng: 120.40, 
                address: 'C区3号楼地下停车场',
                distance: '约200米',
                estimatedTime: '约7分钟',
                alternativeTime: '约9分钟',
                alternativeDistance: '约250米',
                trafficStatus: '畅通',
                type: 'fast',
                price: '¥1.5/度',
                description: '位于C区3号楼地下停车场，配备直流快充桩和休息区',
                facilities: ['restroom', 'shop', 'service'],
                rating: 4.8,
                reviews: 215
            },
            { 
                id: 4, 
                name: 'D区无线充电站', 
                available: 2, 
                total: 3, 
                fast: false, 
                lat: 30.40, 
                lng: 120.45, 
                address: 'D区4号楼地面停车场',
                distance: '约400米',
                estimatedTime: '约12分钟',
                alternativeTime: '约15分钟',
                alternativeDistance: '约450米',
                trafficStatus: '中度拥堵',
                type: 'wireless',
                price: '¥2.0/度',
                description: '位于D区4号楼地面停车场，提供无线充电服务',
                facilities: ['restroom'],
                rating: 4.0,
                reviews: 52
            },
            { 
                id: 5, 
                name: 'E区超级充电站', 
                available: 0, 
                total: 6, 
                fast: true, 
                lat: 30.60, 
                lng: 120.35, 
                address: 'E区5号楼地下停车场',
                distance: '约500米',
                estimatedTime: '约15分钟',
                alternativeTime: '约18分钟',
                alternativeDistance: '约550米',
                trafficStatus: '畅通',
                type: 'fast',
                price: '¥1.8/度',
                description: '位于E区5号楼地下停车场，配备大功率直流快充桩',
                facilities: ['restroom', 'shop', 'service'],
                rating: 4.7,
                reviews: 189
            }
        ];
    }
    
    // 获取充电站详情
    static async getStationDetails(stationId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const stations = await this.getChargingStations();
        return stations.find(s => s.id === parseInt(stationId));
    }
    
    // 搜索充电站
    static async searchStations(keyword) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const stations = await this.getChargingStations();
        return stations.filter(station => 
            station.name.includes(keyword) || 
            station.address.includes(keyword)
        );
    }
    
    // 创建预约
    static async createReservation(stationId, reservationTime, duration) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const reservationId = "R" + Math.floor(Math.random() * 1000);
        return {
            reservationId: reservationId,
            stationId: stationId,
            reservationTime: reservationTime,
            duration: duration,
            status: "Confirmed",
            createdAt: new Date().toISOString()
        };
    }
    
    // 获取用户预约列表
    static async getUserReservations() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                reservationId: "R123",
                stationId: 1,
                stationName: "A区充电站",
                reservationTime: "2023-12-15T14:00:00",
                duration: 60,
                status: "Confirmed",
                createdAt: "2023-12-14T10:30:00"
            }
        ];
    }
    
    // 取消预约
    static async cancelReservation(reservationId) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            message: "预约已取消"
        };
    }
    
    // 获取充电费用
    static async getChargingCost(taskId) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 模拟费用计算
        const duration = Math.floor(Math.random() * 180) + 30; // 30-210分钟
        const power = (Math.random() * 30 + 5).toFixed(1); // 5-35 kWh
        const serviceFee = (Math.random() * 10 + 5).toFixed(2); // 5-15元
        const electricityFee = (parseFloat(power) * 1.2).toFixed(2); // 电费1.2元/kWh
        const total = (parseFloat(serviceFee) + parseFloat(electricityFee)).toFixed(2);
        
        return {
            taskId: taskId,
            duration: duration,
            power: power,
            serviceFee: serviceFee,
            electricityFee: electricityFee,
            total: total
        };
    }
    
    // 处理支付
    static async processPayment(taskId, paymentMethod, amount) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 模拟支付成功
        const paymentId = "P" + Math.floor(Math.random() * 10000);
        return {
            paymentId: paymentId,
            taskId: taskId,
            paymentMethod: paymentMethod,
            amount: amount,
            status: "Success",
            timestamp: new Date().toISOString()
        };
    }
    
    // 获取支付历史
    static async getPaymentHistory() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                paymentId: "P12345",
                taskId: "T123",
                stationName: "B2-017",
                amount: "18.50",
                paymentMethod: "wechat",
                timestamp: "2023-12-10T14:30:00"
            }
        ];
    }
    
    // 获取用户评价
    static async getUserReviews() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                reviewId: "Rev1",
                stationId: 1,
                stationName: "A区充电站",
                rating: 5,
                comment: "充电速度快，位置方便",
                timestamp: "2023-12-08T09:15:00"
            }
        ];
    }
    
    // 提交评价
    static async submitReview(stationId, rating, comment) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const reviewId = "Rev" + Math.floor(Math.random() * 1000);
        return {
            reviewId: reviewId,
            stationId: stationId,
            rating: rating,
            comment: comment,
            timestamp: new Date().toISOString(),
            status: "Success"
        };
    }
    
    // 获取推荐充电站
    static async getRecommendedStations(userLocation, preferences = {}) {
        await new Promise(resolve => setTimeout(resolve, 600));
        
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
    
    // 获取充电站评价列表
    static async getStationReviews(stationId) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 模拟不同充电站的评价数据
        const reviewsData = {
            1: [
                { reviewId: "Rev101", userId: "U123", userName: "张三", rating: 5, comment: "充电速度快，位置方便", timestamp: "2023-12-12T08:30:00", helpful: 12 },
                { reviewId: "Rev102", userId: "U124", userName: "李四", rating: 4, comment: "整体不错，但高峰期需要等待", timestamp: "2023-12-10T14:20:00", helpful: 8 },
                { reviewId: "Rev103", userId: "U125", userName: "王五", rating: 5, comment: "服务态度很好，设施干净", timestamp: "2023-12-08T09:15:00", helpful: 6 }
            ],
            2: [
                { reviewId: "Rev201", userId: "U223", userName: "赵六", rating: 3, comment: "位置还行，但充电速度一般", timestamp: "2023-12-11T16:45:00", helpful: 4 },
                { reviewId: "Rev202", userId: "U224", userName: "钱七", rating: 4, comment: "比较方便，价格合理", timestamp: "2023-12-09T11:30:00", helpful: 7 }
            ],
            3: [
                { reviewId: "Rev301", userId: "U323", userName: "孙八", rating: 5, comment: "全新的充电桩，充电很快", timestamp: "2023-12-13T10:10:00", helpful: 9 },
                { reviewId: "Rev302", userId: "U324", userName: "周九", rating: 4, comment: "环境很好，就是有点难找", timestamp: "2023-12-07T13:25:00", helpful: 5 }
            ]
        };
        
        return reviewsData[stationId] || [];
    }
    
    // 点赞评价
    static async helpfulReview(reviewId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
            success: true,
            message: "已标记为有用",
            newHelpfulCount: Math.floor(Math.random() * 20) + 1
        };
    }
    
    // 获取充电站平均评分
    static async getStationRating(stationId) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const reviews = await this.getStationReviews(stationId);
        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0
            };
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        
        return {
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length
        };
    }
    
    // 获取热门充电站
    static async getPopularStations() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const stations = await this.getChargingStations();
        
        // 模拟热门程度（基于使用频率和评价）
        const popularStations = stations.map(station => {
            // 模拟使用次数
            const usageCount = Math.floor(Math.random() * 500) + 100;
            
            // 获取评分
            return this.getStationRating(station.id).then(rating => {
                return {
                    ...station,
                    usageCount: usageCount,
                    averageRating: rating.averageRating,
                    totalReviews: rating.totalReviews,
                    popularityScore: usageCount * (rating.averageRating / 5) * 10
                };
            });
        });
        
        // 等待所有异步操作完成
        const resolvedStations = await Promise.all(popularStations);
        
        // 按热门程度排序
        return resolvedStations.sort((a, b) => b.popularityScore - a.popularityScore);
    }
    
    // 获取用户偏好设置
    static async getUserPreferences() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟从本地存储或服务器获取用户偏好
        return {
            fastCharging: true,
            highAvailability: true,
            maxDistance: 2000, // 最大距离（米）
            preferredStations: [1], // 偏好的充电站ID
            avoidStations: [] // 避免的充电站ID
        };
    }
    
    // 更新用户偏好设置
    static async updateUserPreferences(preferences) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 模拟保存用户偏好到服务器
        return {
            success: true,
            message: "偏好设置已更新",
            preferences: preferences
        };
    }
    
    // 获取用户资料
    static async getUserProfile() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
            userId: "U123456",
            userName: "张三",
            email: "zhangsan@example.com",
            phone: "138****5678",
            avatar: null,
            memberLevel: "黄金会员",
            joinDate: "2023-01-15",
            totalCharges: 45,
            totalSpent: 1285.50,
            carbonReduction: 126.8
        };
    }
    
    // 更新用户资料
    static async updateUserProfile(profile) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        return {
            success: true,
            message: "个人资料已更新",
            profile: profile
        };
    }
    
    // 获取用户车辆列表
    static async getUserVehicles() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                vehicleId: "V001",
                plateNumber: "京A12345",
                brand: "特斯拉",
                model: "Model 3",
                color: "白色",
                isDefault: true,
                batteryCapacity: 75,
                currentBattery: 60
            },
            {
                vehicleId: "V002",
                plateNumber: "京B67890",
                brand: "比亚迪",
                model: "汉EV",
                color: "黑色",
                isDefault: false,
                batteryCapacity: 85,
                currentBattery: 40
            }
        ];
    }
    
    // 添加车辆
    static async addVehicle(vehicle) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const vehicleId = "V" + Math.floor(Math.random() * 1000);
        return {
            success: true,
            message: "车辆添加成功",
            vehicle: {
                ...vehicle,
                vehicleId: vehicleId,
                isDefault: false,
                batteryCapacity: vehicle.batteryCapacity || 75,
                currentBattery: vehicle.currentBattery || 50
            }
        };
    }
    
    // 更新车辆信息
    static async updateVehicle(vehicleId, vehicle) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        return {
            success: true,
            message: "车辆信息已更新",
            vehicle: {
                ...vehicle,
                vehicleId: vehicleId
            }
        };
    }
    
    // 删除车辆
    static async deleteVehicle(vehicleId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
            success: true,
            message: "车辆已删除",
            vehicleId: vehicleId
        };
    }
    
    // 获取用户通知列表
    static async getNotifications() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                notificationId: "N001",
                type: "system",
                title: "系统维护通知",
                content: "系统将于今晚23:00-次日1:00进行维护，期间服务可能暂时不可用",
                timestamp: "2023-12-14T16:30:00",
                isRead: false
            },
            {
                notificationId: "N002",
                type: "promotion",
                title: "限时优惠",
                content: "本周充电享8折优惠，快来体验吧",
                timestamp: "2023-12-13T10:15:00",
                isRead: true
            },
            {
                notificationId: "N003",
                type: "charging",
                title: "充电完成",
                content: "您的车辆已充电完成，感谢使用",
                timestamp: "2023-12-12T14:45:00",
                isRead: true
            }
        ];
    }
    
    // 标记通知为已读
    static async markNotificationAsRead(notificationId) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return {
            success: true,
            message: "通知已标记为已读",
            notificationId: notificationId
        };
    }
    
    // 获取用户统计数据
    static async getUserStatistics() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
            totalCharges: 45,
            totalChargingTime: 1680, // 分钟
            totalSpent: 1285.50,
            averageChargingTime: 37.33, // 分钟
            favoriteStation: "A区充电站",
            carbonReduction: 126.8,
            monthlyCharges: 8,
            monthlySpent: 228.00,
            savedByPromotions: 45.50
        };
    }
    
    // 提交反馈
    static async submitFeedback(feedback) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const feedbackId = "F" + Math.floor(Math.random() * 1000);
        return {
            success: true,
            message: "反馈已提交，感谢您的建议",
            feedbackId: feedbackId,
            feedback: {
                ...feedback,
                feedbackId: feedbackId,
                timestamp: new Date().toISOString(),
                status: "已提交"
            }
        };
    }
    
    // 获取推荐码
    static async getReferralCode() {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return {
            referralCode: "CHARGE" + Math.floor(Math.random() * 10000),
            referralLink: "https://charging.example.com/referral/CHARGE" + Math.floor(Math.random() * 10000),
            totalReferrals: 5,
            successfulReferrals: 3,
            pendingReferrals: 2,
            totalRewards: 50.00
        };
    }
    
    // 应用推荐码
    static async applyReferralCode(code) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟推荐码验证
        if (code.startsWith("CHARGE") && code.length > 8) {
            return {
                success: true,
                message: "推荐码应用成功！您已获得10元优惠券",
                reward: {
                    type: "coupon",
                    value: 10.00,
                    description: "10元充电优惠券"
                }
            };
        } else {
            return {
                success: false,
                message: "推荐码无效或已过期"
            };
        }
    }
    
    // 获取推荐奖励
    static async getReferralRewards() {
        await new Promise(resolve => setTimeout(resolve, 250));
        
        return [
            {
                rewardId: "R001",
                type: "coupon",
                value: 10.00,
                description: "10元充电优惠券",
                status: "available",
                expiryDate: "2024-01-15T23:59:59",
                obtainedFrom: "推荐好友张三注册",
                obtainedAt: "2023-12-10T14:30:00"
            },
            {
                rewardId: "R002",
                type: "cash",
                value: 5.00,
                description: "5元现金奖励",
                status: "claimed",
                obtainedFrom: "推荐好友李四完成首次充电",
                obtainedAt: "2023-12-05T09:15:00"
            }
        ];
    }
    
    // 获取成就列表
    static async getAchievements() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                achievementId: "A001",
                name: "首次充电",
                description: "完成第一次充电",
                icon: "⚡",
                progress: 1,
                total: 1,
                completed: true,
                completedAt: "2023-11-15T14:30:00",
                reward: "5元优惠券"
            },
            {
                achievementId: "A002",
                name: "环保先锋",
                description: "累计减少碳排放100kg",
                icon: "🌱",
                progress: 126.8,
                total: 100,
                completed: true,
                completedAt: "2023-12-10T09:15:00",
                reward: "20元优惠券"
            },
            {
                achievementId: "A003",
                name: "充电达人",
                description: "累计充电50次",
                icon: "🏆",
                progress: 45,
                total: 50,
                completed: false,
                reward: "50元优惠券"
            }
        ];
    }
    
    // 获取排行榜
    static async getLeaderboard(type = "monthly") {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 模拟不同类型的排行榜数据
        if (type === "monthly") {
            return [
                { rank: 1, userId: "U001", userName: "王先生", avatar: null, value: 12, unit: "次" },
                { rank: 2, userId: "U002", userName: "李女士", avatar: null, value: 10, unit: "次" },
                { rank: 3, userId: "U003", userName: "赵先生", avatar: null, value: 9, unit: "次" },
                { rank: 4, userId: "U123456", userName: "我", avatar: null, value: 8, unit: "次", isCurrentUser: true },
                { rank: 5, userId: "U004", userName: "钱女士", avatar: null, value: 7, unit: "次" }
            ];
        } else if (type === "carbon") {
            return [
                { rank: 1, userId: "U001", userName: "王先生", avatar: null, value: 156.8, unit: "kg" },
                { rank: 2, userId: "U002", userName: "李女士", avatar: null, value: 142.3, unit: "kg" },
                { rank: 3, userId: "U003", userName: "赵先生", avatar: null, value: 135.7, unit: "kg" },
                { rank: 4, userId: "U123456", userName: "我", avatar: null, value: 126.8, unit: "kg", isCurrentUser: true },
                { rank: 5, userId: "U004", userName: "钱女士", avatar: null, value: 118.9, unit: "kg" }
            ];
        }
    }
    
    // 获取机器人数据
    static async getRobots() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                id: 'robot-1',
                name: '移动充电机器人 #01',
                battery: 85,
                status: '空闲',
                serviceRange: 500,
                location: 'A区停车场'
            },
            {
                id: 'robot-2',
                name: '移动充电机器人 #02',
                battery: 62,
                status: '服务中',
                serviceRange: 500,
                location: 'B区充电站',
                target: 'B区充电站',
                estimatedTime: 25
            },
            {
                id: 'robot-3',
                name: '移动充电机器人 #03',
                battery: 45,
                status: '充电中',
                serviceRange: 500,
                location: '充电站'
            },
            {
                id: 'robot-4',
                name: '移动充电机器人 #04',
                battery: 92,
                status: '返回中',
                serviceRange: 500,
                location: '返回途中',
                estimatedTime: 15
            }
        ];
    }
}

// ====================== 系统级控制与调度数据模型 ======================
const controlModel = {
    mode: 'simulation',
    state: '空闲',
    zoom: 1,
    center: { x: 410, y: 210 },
    nodes: [
        { id: 'N1', name: '供能节点 A', x: 140, y: 120, cableLimit: 240, status: '在线' },
        { id: 'N2', name: '供能节点 B', x: 420, y: 80, cableLimit: 220, status: '在线' },
        { id: 'N3', name: '供能节点 C', x: 320, y: 300, cableLimit: 260, status: '在线' }
    ],
    robots: [
        { id: 'R1', name: '机器人 #01', status: '空闲', battery: 82, x: 180, y: 160, connectedNode: 'N1', cableLimit: 240, mode: '自动' },
        { id: 'R2', name: '机器人 #02', status: '执行任务', battery: 67, x: 360, y: 180, connectedNode: 'N2', cableLimit: 220, mode: '自动' },
        { id: 'R3', name: '机器人 #03', status: '充电中', battery: 48, x: 330, y: 260, connectedNode: 'N3', cableLimit: 260, mode: '自动' }
    ],
    tasks: [
        { id: 'T-101', location: 'A区 B1-018', vehicle: 'SUV', demand: 45, priority: 'high', target: { x: 520, y: 190 }, status: '待分配', createdAt: Date.now() - 1000 * 60 * 2 },
        { id: 'T-102', location: 'B区 B2-006', vehicle: '轿车', demand: 28, priority: 'medium', target: { x: 260, y: 260 }, status: '执行中', assignedRobot: 'R2', createdAt: Date.now() - 1000 * 60 * 5 },
        { id: 'T-103', location: 'C区 B3-021', vehicle: 'MPV', demand: 60, priority: 'low', target: { x: 440, y: 340 }, status: '已完成', createdAt: Date.now() - 1000 * 60 * 15 }
    ],
    docking: {
        stages: [
            '到达车位', '进入车底', '车型识别',
            '粗定位', '精定位', '毫米级对准',
            '无线充电启动', '充电中'
        ],
        currentStage: 0,
        progress: 0,
        activeRobot: null
    },
    conflicts: [],
    dispatchLog: []
};

// 创建充电任务
function createNewTask(task) {
    controlModel.tasks.unshift({
        ...task,
        id: `T-${Math.floor(Math.random() * 900 + 100)}`,
        status: '待分配',
        createdAt: Date.now()
    });
    updateTaskQueueUI();
    scheduleTasks();
}

// 任务队列 UI
function updateTaskQueueUI() {
    const container = document.getElementById('task-queue');
    const activeTaskCount = document.getElementById('active-task-count');
    if (!container) return;
    container.innerHTML = '';
    
    controlModel.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-title">${task.location} · ${task.vehicle}</div>
            <div class="task-meta">
                <span>需求: ${task.demand} kWh</span>
                <span>优先级: ${task.priority}</span>
                <span>状态: ${task.status}</span>
                ${task.assignedRobot ? `<span>机器人: ${task.assignedRobot}</span>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
    
    if (activeTaskCount) {
        const active = controlModel.tasks.filter(t => t.status !== '已完成' && t.status !== '异常').length;
        activeTaskCount.textContent = active;
    }
}

// 机器人 UI
function updateRobotMonitor() {
    const list = document.getElementById('robot-monitor-list');
    if (!list) return;
    list.innerHTML = '';
    controlModel.robots.forEach(robot => {
        const statusClass = getRobotStatusClass(robot.status);
        const card = document.createElement('div');
        card.className = 'robot-card';
        card.innerHTML = `
            <div>
                <div class="task-title">${robot.name}</div>
                <div class="robot-meta">
                    <span>状态: <span class="status-pill ${statusClass}">${robot.status}</span></span>
                    <span>电量: ${robot.battery}%</span>
                    <span>位置: (${Math.round(robot.x)}, ${Math.round(robot.y)})</span>
                    <span>接电: ${robot.connectedNode || '未接'}</span>
                </div>
            </div>
            <div class="robot-meta">
                <span>模式: ${robot.mode}</span>
                <span>${robot.currentTask ? `任务: ${robot.currentTask}` : '待命'}</span>
            </div>
        `;
        list.appendChild(card);
    });
}

function getRobotStatusClass(status) {
    if (status.includes('执行') || status === '服务中') return 'status-task';
    if (status.includes('接电') || status.includes('对接')) return 'status-docking';
    if (status.includes('充电')) return 'status-charging';
    if (status.includes('异常')) return 'status-alert';
    return 'status-idle';
}

// 对接流程 UI
function updateDockingFlow() {
    const list = document.getElementById('docking-stage-list');
    const progress = document.getElementById('docking-progress');
    const progressText = document.getElementById('docking-progress-text');
    if (!list) return;
    list.innerHTML = '';
    controlModel.docking.stages.forEach((stage, index) => {
        const row = document.createElement('div');
        row.className = 'docking-step';
        if (index === controlModel.docking.currentStage) row.classList.add('active');
        row.innerHTML = `<span>${stage}</span><span>${index === controlModel.docking.currentStage ? '进行中' : ''}</span>`;
        list.appendChild(row);
    });
    if (progress) progress.style.width = `${controlModel.docking.progress}%`;
    if (progressText) progressText.textContent = controlModel.docking.stages[controlModel.docking.currentStage] || '已完成';
}

// 线缆与供能节点 UI
function updateCableStatusUI() {
    const list = document.getElementById('cable-status-list');
    const nodeCount = document.getElementById('connected-nodes');
    if (!list) return;
    list.innerHTML = '';
    controlModel.nodes.forEach(node => {
        const connected = controlModel.robots.filter(r => r.connectedNode === node.id);
        const card = document.createElement('div');
        card.className = 'cable-card';
        card.innerHTML = `
            <div class="task-title">${node.name}</div>
            <div class="task-meta">
                <span>状态: ${node.status}</span>
                <span>最大线缆: ${node.cableLimit}cm</span>
                <span>接入机器人: ${connected.length}</span>
            </div>
        `;
        list.appendChild(card);
    });
    if (nodeCount) {
        const activeNodes = controlModel.nodes.filter(node => controlModel.robots.some(r => r.connectedNode === node.id)).length;
        nodeCount.textContent = `${activeNodes}/${controlModel.nodes.length}`;
    }
}

// 调度日志与冲突
function updateDispatchUI() {
    const log = document.getElementById('dispatch-log');
    const conflictList = document.getElementById('conflict-list');
    const conflictCount = document.getElementById('conflict-count');
    if (log) {
        log.innerHTML = '';
        controlModel.dispatchLog.slice(-6).reverse().forEach(item => {
            const row = document.createElement('div');
            row.className = 'dispatch-item';
            row.innerHTML = `<strong>${item.title}</strong><div class="task-meta"><span>${item.detail}</span><span>${item.time}</span></div>`;
            log.appendChild(row);
        });
    }
    if (conflictList) {
        conflictList.innerHTML = '';
        controlModel.conflicts.forEach(conflict => {
            const row = document.createElement('div');
            row.className = 'conflict-item alert';
            row.innerHTML = `<strong>${conflict.robots.join(' vs ')}</strong><div class="task-meta"><span>${conflict.type}</span><span>${conflict.resolution}</span></div>`;
            conflictList.appendChild(row);
        });
    }
    if (conflictCount) conflictCount.textContent = controlModel.conflicts.length;
}

// 概览状态
function updateOverviewState() {
    const state = document.getElementById('system-state');
    const hasError = controlModel.robots.some(r => r.status.includes('异常'));
    const docking = !!controlModel.docking.activeRobot;
    const charging = controlModel.robots.some(r => r.status.includes('充电'));
    const working = controlModel.robots.some(r => r.status.includes('执行'));
    
    if (hasError) controlModel.state = '异常';
    else if (docking) controlModel.state = '接电/对接';
    else if (charging) controlModel.state = '充电';
    else if (working) controlModel.state = '执行任务';
    else controlModel.state = '空闲';
    
    if (state) state.textContent = controlModel.state;
}

// 调度策略：最近可用机器人 + 优先级
function scheduleTasks() {
    const waitingTasks = controlModel.tasks.filter(t => t.status === '待分配');
    waitingTasks.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
    
    waitingTasks.forEach(task => {
        const idleRobot = controlModel.robots
            .filter(r => r.status === '空闲' || r.status === '返回中')
            .sort((a, b) => distance(a, task.target) - distance(b, task.target))[0];
        if (idleRobot) {
            assignTask(idleRobot, task);
        }
    });
    updateDispatchUI();
}

function priorityWeight(priority) {
    if (priority === 'high') return 3;
    if (priority === 'medium') return 2;
    return 1;
}

function assignTask(robot, task) {
    task.status = '执行中';
    task.assignedRobot = robot.id;
    robot.currentTask = task.id;
    robot.status = '执行任务';
    robot.path = buildPath(robot, task.target);
    addDispatchLog(`分配 ${task.id}`, `${robot.name} → ${task.location}`);
}

function addDispatchLog(title, detail) {
    controlModel.dispatchLog.push({
        title,
        detail,
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
    });
}

// 路径规划（简化直线 + 约束投影）
function buildPath(robot, target) {
    if (!robot.connectedNode) return [ { x: robot.x, y: robot.y }, target ];
    const node = controlModel.nodes.find(n => n.id === robot.connectedNode);
    const distToTarget = distance(node, target);
    if (distToTarget > robot.cableLimit) {
        // 投影到可达域边界
        const ratio = (robot.cableLimit - 10) / distToTarget;
        const constrained = {
            x: node.x + (target.x - node.x) * ratio,
            y: node.y + (target.y - node.y) * ratio
        };
        return [ { x: robot.x, y: robot.y }, constrained ];
    }
    return [ { x: robot.x, y: robot.y }, target ];
}

// 地图绘制
function renderControlMap() {
    const canvas = document.getElementById('control-map');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // 背景网格
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < width; x += 40 * controlModel.zoom) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 40 * controlModel.zoom) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    ctx.restore();
    
    // 车位块
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 6; i++) {
        ctx.strokeRect(80 + i * 100, 110, 60, 120);
    }
    ctx.restore();
    
    // 供能节点及可达域
    controlModel.nodes.forEach(node => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59,130,246,0.25)';
        ctx.lineWidth = 1.5;
        ctx.arc(node.x, node.y, node.cableLimit, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(node.x - 6, node.y - 6, 12, 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(node.name, node.x + 10, node.y - 10);
        ctx.restore();
    });
    
    // 任务目标
    controlModel.tasks.forEach(task => {
        if (task.status === '已完成') return;
        ctx.save();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(task.target.x, task.target.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(task.id, task.target.x + 10, task.target.y);
        ctx.restore();
    });
    
    // 机器人与路径
    controlModel.robots.forEach(robot => {
        const node = controlModel.nodes.find(n => n.id === robot.connectedNode);
        if (node) {
            const cableDist = distance(robot, node);
            const tensionRatio = cableDist / (robot.cableLimit || node.cableLimit);
            ctx.save();
            ctx.strokeStyle = tensionRatio > 1 ? '#ef4444' : tensionRatio > 0.7 ? '#f59e0b' : '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(robot.x, robot.y);
            ctx.stroke();
            ctx.restore();
        }
        
        if (robot.path) {
            ctx.save();
            ctx.strokeStyle = '#6366f1';
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(robot.x, robot.y);
            robot.path.forEach(p => {
                ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.save();
        ctx.fillStyle = robotColor(robot.status);
        ctx.beginPath();
        ctx.arc(robot.x, robot.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(robot.id, robot.x - 10, robot.y - 14);
        ctx.restore();
    });
}

function robotColor(status) {
    if (status.includes('执行')) return '#6366f1';
    if (status.includes('接电') || status.includes('对接')) return '#f59e0b';
    if (status.includes('充电')) return '#10b981';
    if (status.includes('异常')) return '#ef4444';
    return '#9ca3af';
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// 仿真 tick
function simulationTick() {
    controlModel.robots.forEach(robot => {
        if (!robot.currentTask) return;
        const task = controlModel.tasks.find(t => t.id === robot.currentTask);
        if (!task || task.status === '已完成') return;
        const target = robot.path ? robot.path[robot.path.length - 1] : task.target;
        const dx = target.x - robot.x;
        const dy = target.y - robot.y;
        const step = 12;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
            robot.x += (dx / dist) * step;
            robot.y += (dy / dist) * step;
            robot.status = '执行任务';
        } else if (controlModel.docking.activeRobot !== robot.id) {
            startDocking(robot, task);
        }
    });
    
    advanceDocking();
    detectConflicts();
    renderControlMap();
    updateRobotMonitor();
    updateCableStatusUI();
    updateOverviewState();
    updateDispatchUI();
}

function startDocking(robot, task) {
    controlModel.docking.activeRobot = robot.id;
    controlModel.docking.currentStage = 0;
    controlModel.docking.progress = 0;
    robot.status = '接电/对接';
    addDispatchLog(`对接 ${task.id}`, `${robot.name} 进入精对准流程`);
}

function advanceDocking() {
    if (!controlModel.docking.activeRobot) return;
    controlModel.docking.progress += 18;
    if (controlModel.docking.progress >= 100) {
        controlModel.docking.progress = 0;
        controlModel.docking.currentStage += 1;
    }
    if (controlModel.docking.currentStage >= controlModel.docking.stages.length) {
        const robot = controlModel.robots.find(r => r.id === controlModel.docking.activeRobot);
        const task = controlModel.tasks.find(t => t.id === robot.currentTask);
        if (robot && task) {
            robot.status = '充电中';
            task.status = '已完成';
            addDispatchLog(`任务完成 ${task.id}`, `${robot.name} 已启动无线充电`);
            robot.currentTask = null;
            robot.path = [];
        }
        controlModel.docking.activeRobot = null;
        controlModel.docking.currentStage = 0;
    }
    updateDockingFlow();
}

function detectConflicts() {
    controlModel.conflicts = [];
    for (let i = 0; i < controlModel.robots.length; i++) {
        for (let j = i + 1; j < controlModel.robots.length; j++) {
            const a = controlModel.robots[i];
            const b = controlModel.robots[j];
            if (distance(a, b) < 40) {
                controlModel.conflicts.push({
                    robots: [a.id, b.id],
                    type: '时空冲突',
                    resolution: '等待 + 改道'
                });
            }
        }
    }
}

// 事件初始化
function initControlCenter() {
    const modeSelect = document.getElementById('system-mode');
    const createTaskBtn = document.getElementById('create-task-btn');
    const zoomIn = document.getElementById('zoom-in-btn');
    const zoomOut = document.getElementById('zoom-out-btn');
    const locateBtn = document.getElementById('locate-btn');
    
    // 让已有任务与机器人对齐
    controlModel.tasks.forEach(task => {
        if (task.assignedRobot) {
            const robot = controlModel.robots.find(r => r.id === task.assignedRobot);
            if (robot) {
                robot.currentTask = task.id;
                robot.path = buildPath(robot, task.target);
                robot.status = task.status === '已完成' ? '充电中' : '执行任务';
            }
        }
    });
    
    if (modeSelect) {
        modeSelect.addEventListener('change', () => {
            controlModel.mode = modeSelect.value === 'hardware' ? '实物接口' : '仿真模式';
            addDispatchLog('模式切换', `当前模式：${controlModel.mode}`);
            updateOverviewState();
            updateDispatchUI();
        });
    }
    
    if (zoomIn) {
        zoomIn.addEventListener('click', () => {
            controlModel.zoom = Math.min(1.6, controlModel.zoom + 0.1);
            renderControlMap();
        });
    }
    if (zoomOut) {
        zoomOut.addEventListener('click', () => {
            controlModel.zoom = Math.max(0.6, controlModel.zoom - 0.1);
            renderControlMap();
        });
    }
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            addDispatchLog('定位', '回到停车场中心');
            renderControlMap();
            updateDispatchUI();
        });
    }
    
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', () => {
            const location = document.getElementById('task-location').value || '未命名车位';
            const vehicle = document.getElementById('task-vehicle').value || '未知车型';
            const demand = parseInt(document.getElementById('task-demand').value || '40', 10);
            const priority = document.getElementById('task-priority').value;
            const target = {
                x: Math.random() * 680 + 80,
                y: Math.random() * 260 + 80
            };
            createNewTask({ location, vehicle, demand, priority, target });
        });
    }
    
    // 初始 UI
    updateTaskQueueUI();
    updateRobotMonitor();
    updateDockingFlow();
    updateCableStatusUI();
    updateDispatchUI();
    updateOverviewState();
    renderControlMap();
    
    // 周期刷新
    setInterval(simulationTick, 1800);
}

// 初始化地图搜索和筛选功能
function initMapSearchAndFilter() {
    // 高级搜索选项切换
    const advancedSearchToggle = document.getElementById('advanced-search-toggle');
    const advancedSearchOptions = document.getElementById('advanced-search-options');
    
    if (advancedSearchToggle && advancedSearchOptions) {
        advancedSearchToggle.addEventListener('click', () => {
            const isExpanded = advancedSearchOptions.style.display !== 'none';
            advancedSearchOptions.style.display = isExpanded ? 'none' : 'block';
            
            // 更新切换图标
            const toggleIcon = advancedSearchToggle.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.textContent = isExpanded ? '▼' : '▲';
            }
        });
    }
    
    // 价格范围滑块
    const priceMinSlider = document.getElementById('price-min');
    const priceMaxSlider = document.getElementById('price-max');
    const priceMinValue = document.getElementById('price-min-value');
    const priceMaxValue = document.getElementById('price-max-value');
    
    if (priceMinSlider && priceMinValue) {
        // 使用防抖函数优化滑块输入性能
        const debouncedMinSliderUpdate = debounce(() => {
            priceMinValue.textContent = `¥${priceMinSlider.value}/度`;
            
            // 确保最小值不大于最大值
            if (parseFloat(priceMinSlider.value) > parseFloat(priceMaxSlider.value)) {
                priceMaxSlider.value = priceMinSlider.value;
                if (priceMaxValue) priceMaxValue.textContent = `¥${priceMaxSlider.value}/度`;
            }
        }, 50);
        
        priceMinSlider.addEventListener('input', debouncedMinSliderUpdate);
    }
    
    if (priceMaxSlider && priceMaxValue) {
        // 使用防抖函数优化滑块输入性能
        const debouncedMaxSliderUpdate = debounce(() => {
            priceMaxValue.textContent = `¥${priceMaxSlider.value}/度`;
            
            // 确保最大值不小于最小值
            if (parseFloat(priceMaxSlider.value) < parseFloat(priceMinSlider.value)) {
                priceMinSlider.value = priceMaxSlider.value;
                if (priceMinValue) priceMinValue.textContent = `¥${priceMinSlider.value}/度`;
            }
        }, 50);
        
        priceMaxSlider.addEventListener('input', debouncedMaxSliderUpdate);
    }
    
    // 应用筛选按钮
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyMapFilters);
    }
    
    // 重置筛选按钮
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetMapFilters);
    }
    
    // 快速筛选标签
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // 移除所有标签的活动状态
            filterTags.forEach(t => t.classList.remove('active'));
            // 设置当前标签为活动状态
            tag.classList.add('active');
            
            // 应用快速筛选
            const filterType = tag.getAttribute('data-filter');
            applyQuickFilter(filterType);
        });
    });
    
    // 语音搜索按钮
    const voiceSearchBtn = document.getElementById('voice-search-btn');
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', startVoiceSearch);
    }
    
    // 搜索框
    const locationSearch = document.getElementById('location-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchBtn && locationSearch) {
        searchBtn.addEventListener('click', () => {
            performSearch(locationSearch.value);
        });
    }
    
    if (locationSearch) {
        // 使用防抖函数优化搜索输入性能
        const debouncedSearch = debounce(function(query) {
            performSearch(query);
        }, 300);
        
        // 监听输入事件，使用防抖处理
        locationSearch.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
        
        // 保留回车键搜索功能
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(locationSearch.value);
            }
        });
    }
}

// 应用地图筛选
function applyMapFilters() {
    // 获取筛选条件
    const searchRange = document.querySelector('input[name="search-range"]:checked')?.value || 'all';
    const dcFast = document.getElementById('dc-fast')?.checked || false;
    const acSlow = document.getElementById('ac-slow')?.checked || false;
    const wireless = document.getElementById('wireless')?.checked || false;
    const hasRestroom = document.getElementById('has-restroom')?.checked || false;
    const hasShop = document.getElementById('has-shop')?.checked || false;
    const hasService = document.getElementById('has-service')?.checked || false;
    const priceMin = parseFloat(document.getElementById('price-min')?.value || 0);
    const priceMax = parseFloat(document.getElementById('price-max')?.value || 3);
    
    // 获取所有充电站
    const allStations = chargingStations;
    
    // 应用筛选条件
    const filteredStations = allStations.filter(station => {
        // 距离筛选
        if (searchRange !== 'all') {
            const distance = parseFloat(station.distance?.replace(/[^\d.]/g, '') || 0);
            if (distance > parseInt(searchRange)) return false;
        }
        
        // 充电类型筛选
        if (!dcFast && station.type === 'fast') return false;
        if (!acSlow && station.type === 'slow') return false;
        if (!wireless && station.type === 'wireless') return false;
        
        // 服务设施筛选
        if (hasRestroom && !station.facilities?.includes('restroom')) return false;
        if (hasShop && !station.facilities?.includes('shop')) return false;
        if (hasService && !station.facilities?.includes('service')) return false;
        
        // 价格筛选
        const stationPrice = parseFloat(station.price?.replace(/[^\d.]/g, '') || 1);
        if (stationPrice < priceMin || stationPrice > priceMax) return false;
        
        return true;
    });
    
    // 更新地图标记
    updateMapMarkers(filteredStations);
    
    // 更新搜索结果计数
    updateSearchResultsCount(filteredStations.length);
    
    // 显示筛选成功消息
    showMessage(requestMessage, `已找到 ${filteredStations.length} 个符合条件的充电站`, true, 'success');
}

// 重置地图筛选
function resetMapFilters() {
    // 重置距离范围
    const defaultRangeRadio = document.querySelector('input[name="search-range"][value="500"]');
    if (defaultRangeRadio) defaultRangeRadio.checked = true;
    
    // 重置充电类型
    const dcFast = document.getElementById('dc-fast');
    const acSlow = document.getElementById('ac-slow');
    if (dcFast) dcFast.checked = true;
    if (acSlow) acSlow.checked = true;
    
    const wireless = document.getElementById('wireless');
    if (wireless) wireless.checked = false;
    
    // 重置服务设施
    const hasRestroom = document.getElementById('has-restroom');
    const hasShop = document.getElementById('has-shop');
    const hasService = document.getElementById('has-service');
    if (hasRestroom) hasRestroom.checked = false;
    if (hasShop) hasShop.checked = false;
    if (hasService) hasService.checked = false;
    
    // 重置价格范围
    const priceMinSlider = document.getElementById('price-min');
    const priceMaxSlider = document.getElementById('price-max');
    const priceMinValue = document.getElementById('price-min-value');
    const priceMaxValue = document.getElementById('price-max-value');
    
    if (priceMinSlider) priceMinSlider.value = 0.5;
    if (priceMaxSlider) priceMaxSlider.value = 3;
    if (priceMinValue) priceMinValue.textContent = '¥0.5/度';
    if (priceMaxValue) priceMaxValue.textContent = '¥3.0/度';
    
    // 重置快速筛选标签
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => tag.classList.remove('active'));
    const allFilterTag = document.querySelector('.filter-tag[data-filter="all"]');
    if (allFilterTag) allFilterTag.classList.add('active');
    
    // 显示所有充电站
    updateMapMarkers(chargingStations);
    
    // 更新搜索结果计数
    updateSearchResultsCount(chargingStations.length);
    
    // 显示重置成功消息
    showMessage(requestMessage, '筛选条件已重置', true, 'info');
}

// 应用快速筛选
function applyQuickFilter(filterType) {
    let filteredStations = [...chargingStations];
    
    switch (filterType) {
        case 'nearest':
            // 按距离排序，显示最近的5个
            filteredStations.sort((a, b) => {
                const distA = parseFloat(a.distance?.replace(/[^\d.]/g, '') || 999);
                const distB = parseFloat(b.distance?.replace(/[^\d.]/g, '') || 999);
                return distA - distB;
            });
            filteredStations = filteredStations.slice(0, 5);
            break;
            
        case 'available':
            // 按可用数量排序，显示可用最多的5个
            filteredStations.sort((a, b) => b.available - a.available);
            filteredStations = filteredStations.slice(0, 5);
            break;
            
        case 'cheapest':
            // 按价格排序，显示最便宜的5个
            filteredStations.sort((a, b) => {
                const priceA = parseFloat(a.price?.replace(/[^\d.]/g, '') || 999);
                const priceB = parseFloat(b.price?.replace(/[^\d.]/g, '') || 999);
                return priceA - priceB;
            });
            filteredStations = filteredStations.slice(0, 5);
            break;
            
        case 'fastest':
            // 只显示快充站
            filteredStations = filteredStations.filter(station => station.type === 'fast');
            break;
            
        default:
            // 显示所有
            break;
    }
    
    // 更新地图标记
    updateMapMarkers(filteredStations);
    
    // 更新搜索结果计数
    updateSearchResultsCount(filteredStations.length);
    
    // 显示筛选结果消息
    const filterNames = {
        'all': '全部充电站',
        'nearest': '最近的充电站',
        'available': '可用最多的充电站',
        'cheapest': '价格最低的充电站',
        'fastest': '快充站'
    };
    
    showMessage(requestMessage, `已为您筛选${filterNames[filterType] || '充电站'}`, true, 'info');
}

// 执行搜索
function performSearch(query) {
    if (!query || query.trim() === '') {
        showMessage(requestMessage, '请输入搜索关键词', false, 'warning');
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    // 搜索匹配的充电站
    const matchedStations = chargingStations.filter(station => {
        return station.name.toLowerCase().includes(searchTerm) ||
               (station.address && station.address.toLowerCase().includes(searchTerm)) ||
               (station.description && station.description.toLowerCase().includes(searchTerm));
    });
    
    // 更新地图标记
    updateMapMarkers(matchedStations);
    
    // 更新搜索结果计数
    updateSearchResultsCount(matchedStations.length);
    
    // 显示搜索结果消息
    if (matchedStations.length > 0) {
        showMessage(requestMessage, `找到 ${matchedStations.length} 个与"${query}"相关的充电站`, true, 'success');
    } else {
        showMessage(requestMessage, `未找到与"${query}"相关的充电站`, false, 'warning');
    }
}

// 开始语音搜索
function startVoiceSearch() {
    const voiceSearchBtn = document.getElementById('voice-search-btn');
    
    // 检查浏览器是否支持语音识别
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showMessage(requestMessage, '您的浏览器不支持语音搜索功能', false, 'warning');
        return;
    }
    
    // 创建语音识别实例
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // 设置识别参数
    recognition.lang = 'zh-CN'; // 中文识别
    recognition.continuous = false; // 不连续识别
    recognition.interimResults = false; // 不返回临时结果
    
    // 添加监听事件
    recognition.onstart = () => {
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.add('listening');
            voiceSearchBtn.textContent = '🔴';
        }
        showMessage(requestMessage, '正在听取您的搜索内容...', true, 'info');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const locationSearch = document.getElementById('location-search');
        if (locationSearch) {
            locationSearch.value = transcript;
        }
        
        // 自动执行搜索
        performSearch(transcript);
    };
    
    recognition.onerror = (event) => {
        let errorMessage = '语音搜索失败';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = '未检测到语音，请重试';
                break;
            case 'audio-capture':
                errorMessage = '无法访问麦克风，请检查权限设置';
                break;
            case 'not-allowed':
                errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许';
                break;
            case 'network':
                errorMessage = '网络错误，请检查网络连接';
                break;
        }
        
        showMessage(requestMessage, errorMessage, false, 'warning');
    };
    
    recognition.onend = () => {
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.remove('listening');
            voiceSearchBtn.textContent = '🎤';
        }
    };
    
    // 开始识别
    try {
        recognition.start();
    } catch (error) {
        showMessage(requestMessage, '启动语音识别失败，请重试', false, 'warning');
    }
}

// 更新搜索结果计数
function updateSearchResultsCount(count) {
    // 搜索结果计数功能已移除，保留函数以避免错误
    console.log(`搜索结果: ${count}个充电站`);
}

// 当前任务状态
let currentTask = null;

// DOM元素
const requestPage = document.getElementById('request-page');
const statusPage = document.getElementById('status-page');
const profilePage = document.getElementById('profile-page');
const mapPage = document.getElementById('map-page');
const reservationPage = document.getElementById('reservation-page');
const paymentPage = document.getElementById('payment-page');
const requestChargeBtn = document.getElementById('request-charge-btn');
const refreshStatusBtn = document.getElementById('refresh-status-btn');
const requestMessage = document.getElementById('request-message');
const taskIdElement = document.getElementById('task-id');
const taskStatusElement = document.getElementById('task-status');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const taskVehicleElement = document.getElementById('task-vehicle');
const taskChargeTypeElement = document.getElementById('task-charge-type');
const taskLocationElement = document.getElementById('task-location');
const estimatedTimeElement = document.getElementById('estimated-time');
const locationSelect = document.getElementById('location');

// 导航功能
function setupNavigation() {
    console.warn('setupNavigation() 已弃用，路由系统已由 Router 类管理');
    // 这个函数保留是为了向后兼容，但实际功能已由 Router 类接管
}
function showMessage(element, message, isSuccess = true) {
    element.textContent = message;
}

// 兼容性函数 - 使用新的路由系统
function showPage(pageId) {
    console.warn(`showPage() 已弃用，请使用 router.navigateTo() 代替`);
    router.navigateTo(pageId);
}

// 显示消息
function showMessage(element, message, isSuccess = true, type = 'default') {
    // 确定消息类型
    let messageType = isSuccess ? 'success' : 'error';
    if (type !== 'default') {
        messageType = type;
    }
    
    // 设置消息内容和样式
    element.textContent = message;
    element.className = `status-message ${messageType}`;
    element.classList.remove('hidden');
    
    // 添加动画效果
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    // 触发动画
    setTimeout(() => {
        element.style.transition = 'all 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 10);
    
    // 根据消息类型设置自动隐藏时间
    const autoHideTime = messageType === 'error' ? 5000 : 3000;
    
    // 设置自动隐藏
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            element.classList.add('hidden');
        }, 300);
    }, autoHideTime);
}

// 显示进度指示器
function showProgressIndicator(percentage = 0) {
    const progressBar = document.getElementById('progress-bar-fill');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

// 隐藏进度指示器
function hideProgressIndicator() {
    const progressBar = document.getElementById('progress-bar-fill');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// 申请充电
async function requestCharge() {
    // 如果是从表单提交，先显示确认弹窗
    if (!document.getElementById('charge-confirm-modal').classList.contains('hidden')) {
        // 弹窗已经显示，继续执行充电请求
    } else {
        // 显示确认弹窗
        showChargeConfirmModal();
        return;
    }
    
    const location = document.getElementById('location').value;
    const vehicle = document.getElementById('vehicle').value;
    const chargeTypeElement = document.querySelector('input[name="charge-type"]:checked');
    const chargeType = chargeTypeElement ? chargeTypeElement.value : 'fast'; // 默认快充
    
    // 验证输入
    if (!location) {
        showMessage(requestMessage, '请选择充电位置', false, 'error');
        return;
    }
    
    if (!vehicle) {
        showMessage(requestMessage, '请选择车辆', false, 'error');
        return;
    }
    
    try {
        // 显示进度指示器
        showProgressIndicator(10);
        
        // 禁用按钮，防止重复点击
        requestChargeBtn.disabled = true;
        requestChargeBtn.innerHTML = '<span class="loading-indicator"></span>启动中...';
        
        // 显示初始化消息
        showMessage(requestMessage, '正在初始化充电请求...', true, 'info');
        showProgressIndicator(30);
        
        // 模拟初始化过程
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 显示验证消息
        showMessage(requestMessage, '正在验证车辆信息...', true, 'info');
        showProgressIndicator(50);
        
        // 模拟验证过程
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 显示连接消息
        showMessage(requestMessage, '正在连接充电服务...', true, 'info');
        showProgressIndicator(70);
        
        // 调用API，一次性提交所有充电参数
        showProgressIndicator(90);
        const task = await ApiService.requestChargeWithParams(location, vehicle, chargeType);
        currentTask = task;
        
        // 完成进度
        showProgressIndicator(100);
        
        // 显示成功消息，包含具体信息
        const chargeTypeText = chargeType === 'fast' ? '快充' : '慢充';
        showMessage(
            requestMessage, 
            `✅ 充电已成功启动！\n🤖 充电机器人正在前往${location}\n🚗 为您的${vehicle}提供${chargeTypeText}服务`, 
            true, 
            'success'
        );
        
        // 更新状态页面
        updateTaskDisplay(task);
        
        // 1.5秒后自动切换到状态页面
        setTimeout(() => {
            hideProgressIndicator();
            const statusPageBtn = document.querySelector('[data-page="status-page"]');
            if (statusPageBtn) statusPageBtn.click();
        }, 1500);
        
    } catch (error) {
        // 隐藏进度指示器
        hideProgressIndicator();
        
        // 根据错误类型提供具体的错误消息
        let errorMessage = '启动失败，请重试';
        if (error.message) {
            if (error.message.includes('network') || error.message.includes('Network')) {
                errorMessage = '网络连接失败，请检查网络连接后重试';
            } else if (error.message.includes('timeout')) {
                errorMessage = '请求超时，请稍后重试';
            } else if (error.message.includes('vehicle')) {
                errorMessage = '车辆信息验证失败，请检查车辆信息';
            } else if (error.message.includes('location')) {
                errorMessage = '充电位置不可用，请选择其他位置';
            } else if (error.message.includes('server') || error.message.includes('500')) {
                errorMessage = '服务器暂时不可用，请稍后重试';
            } else {
                errorMessage = `启动失败：${error.message}`;
            }
        }
        
        // 显示错误消息，提供重试建议
        showMessage(
            requestMessage, 
            `${errorMessage}\n💡 如问题持续存在，请联系客服或尝试更换充电位置`, 
            false, 
            'error'
        );
        
        console.error('充电启动失败:', error);
    } finally {
        // 恢复按钮状态
        requestChargeBtn.disabled = false;
        requestChargeBtn.textContent = '一键启动充电';
        
        // 延迟隐藏进度指示器，确保用户能看到完成状态
        setTimeout(() => {
            hideProgressIndicator();
        }, 2000);
    }
}

// 更新任务显示
function updateTaskDisplay(task) {
    taskIdElement.textContent = task.taskId;
    taskStatusElement.textContent = getStatusText(task.status);
    progressBar.style.setProperty('--progress', `${task.progress * 100}%`);
    progressText.textContent = `${Math.round(task.progress * 100)}%`;
    
    // 更新新增的显示元素
    taskVehicleElement.textContent = task.vehicle || '--';
    taskChargeTypeElement.textContent = task.chargeType === 'fast' ? '快充' : '慢充';
    taskLocationElement.textContent = task.location || '--';
    
    // 计算并显示预计剩余时间
    if (task.estimatedTime && task.progress >= 0) {
        const remainingMinutes = Math.round(task.estimatedTime * (1 - task.progress));
        if (remainingMinutes > 0) {
            estimatedTimeElement.textContent = `${remainingMinutes} 分钟`;
        } else {
            estimatedTimeElement.textContent = '即将完成';
        }
    } else {
        estimatedTimeElement.textContent = '--';
    }
    
    // 如果任务开始进行中，启动充电过程可视化
    if (task.status === 'Dispatched' || task.status === 'Charging') {
        simulateChargingProcess();
    }
}

// 获取状态文本
function getStatusText(status) {
    switch(status) {
        case 'Waiting': return '等待中';
        case 'Charging': return '充电中';
        case 'Completed': return '已完成';
        default: return status;
    }
}

// 更新任务状态
async function updateTaskStatus() {
    if (!currentTask) return;
    
    try {
        refreshStatusBtn.disabled = true;
        refreshStatusBtn.textContent = '刷新中...';
        
        const task = await ApiService.getTaskStatus(currentTask.taskId);
        currentTask = task;
        updateTaskDisplay(task);
        
        // 如果任务完成，显示完成消息
        if (task.status === 'Completed') {
            showMessage(requestMessage, '充电已完成！', true);
            
            // 添加到历史记录
            addHistoryItem(task);
        }
        
    } catch (error) {
        console.error('获取状态失败:', error);
    } finally {
        refreshStatusBtn.disabled = false;
        refreshStatusBtn.textContent = '刷新状态';
    }
}

// 添加历史记录
function addHistoryItem(task) {
    const historyList = document.getElementById('history-list');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span>${dateStr}</span>
        <span>${task.location || '未知位置'}</span>
        <span class="status-complete">已完成</span>
    `;
    
    // 插入到历史记录列表的开头
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // 限制历史记录数量
    const historyItems = historyList.querySelectorAll('.history-item');
    if (historyItems.length > 5) {
        historyList.removeChild(historyItems[historyItems.length - 1]);
    }
}

// 初始化应用
// 应用初始化函数
function initApp() {
    // 初始化全局性能优化器
    if (typeof GlobalPerformanceOptimizer !== 'undefined' && GlobalPerformanceOptimizer.instance) {
        globalOptimizer = GlobalPerformanceOptimizer.instance;
        console.log('全局性能优化器已集成到应用中');
    }
    
    // 初始化路由系统
    router.init();
    
    // 添加测试函数到全局作用域，方便调试
    window.testNavigation = function(pageId) {
        console.log(`测试导航到页面: ${pageId}`);
        router.navigateTo(pageId);
    };
    
    // 添加测试所有页面的函数
    window.testAllPages = function() {
        const pages = Array.from(router.pages.keys());
        console.log(`测试所有 ${pages.length} 个页面`);
        pages.forEach((pageId, index) => {
            setTimeout(() => {
                console.log(`测试页面: ${pageId}`);
                router.navigateTo(pageId);
            }, index * 1000);
        });
    };
    
    // 添加路由调试函数
    window.routerDebug = function() {
        console.log('当前页面:', router.getCurrentPage());
        console.log('历史记录:', router.getHistory());
        console.log('所有页面:', Array.from(router.pages.keys()));
        console.log('所有导航项:', Array.from(router.navigationItems.keys()));
    };
    
    console.log('应用初始化完成，可以使用 testNavigation("页面ID") 进行测试');
    console.log('使用 testAllPages() 可以测试所有页面切换');
    console.log('使用 routerDebug() 可以查看路由状态');
    
    // 初始化其他功能模块
    initOtherFeatures();
}

// 初始化其他功能模块
function initOtherFeatures() {
    // 初始化充电站数据
    if (typeof loadChargingStations === 'function') {
        loadChargingStations();
    }
    
    // 初始化地图功能
    if (typeof initMap === 'function') {
        initMap();
    }
    
    // 初始化用户界面
    if (typeof initUserInterface === 'function') {
        initUserInterface();
    }
    
    // 初始化状态监控
    if (typeof initStatusMonitoring === 'function') {
        initStatusMonitoring();
    }
    
    // 初始化引导覆盖层
    if (typeof initGuideOverlay === 'function') {
        initGuideOverlay();
    }
    
    // 直接在控制台输出导航栏状态
    setTimeout(() => {
        console.log('=== 导航栏状态检查 ===');
        const navItems = document.querySelectorAll('.nav-item');
        console.log(`找到 ${navItems.length} 个导航项`);
        navItems.forEach((item, index) => {
            const page = item.getAttribute('data-page');
            const isActive = item.classList.contains('active');
            console.log(`导航项 ${index}: ${page}, 活动状态: ${isActive}`);
        });
        
        const pages = document.querySelectorAll('.page');
        console.log(`找到 ${pages.length} 个页面`);
        pages.forEach((page, index) => {
            const isActive = page.classList.contains('active');
            console.log(`页面 ${index}: ${page.id}, 活动状态: ${isActive}`);
        });
        console.log('=== 检查完成 ===');
    }, 200);
    
    // 绑定事件 - 添加空值检查
    if (requestChargeBtn) {
        requestChargeBtn.addEventListener('click', requestCharge);
    }
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', updateTaskStatus);
    }
    
    // 绑定快速充电按钮
    const quickChargeBtn = document.getElementById('quick-charge-btn');
    const scanChargeBtn = document.getElementById('scan-charge-btn');
    
    // 立即充电 - 使用默认值快速启动
    if (quickChargeBtn) {
        quickChargeBtn.addEventListener('click', async () => {
            // 设置默认值
            const locationElement = document.getElementById('location');
            const vehicleElement = document.getElementById('vehicle');
            const chargeTypeElement = document.querySelector('input[name="charge-type"][value="fast"]');
            
            if (locationElement) locationElement.value = 'A1-101';
            if (vehicleElement) vehicleElement.value = '京A12345';
            if (chargeTypeElement) chargeTypeElement.checked = true;
            
            // 显示确认弹窗
            showChargeConfirmModal();
        });
    }
    
    // 扫码充电 - 模拟扫码后自动填充位置
    if (scanChargeBtn) {
        scanChargeBtn.addEventListener('click', async () => {
            // 模拟扫码结果
            const scannedLocation = 'B2-017'; // 假设扫码得到的位置
            const locationElement = document.getElementById('location');
            if (locationElement) locationElement.value = scannedLocation;
            
            // 显示扫码成功提示
            showMessage(requestMessage, `扫码成功！位置：${scannedLocation}`, true);
            
            // 滚动到充电表单
            const formSection = document.querySelector('.charge-form-section');
            if (formSection) {
                formSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        });
    }
    
    // 绑定弹窗相关事件
    const chargeConfirmModal = document.getElementById('charge-confirm-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelChargeBtn = document.getElementById('cancel-charge-btn');
    const confirmChargeBtn = document.getElementById('confirm-charge-btn');
    
    // 关闭弹窗
    const closeModal = () => {
        if (chargeConfirmModal) {
            chargeConfirmModal.classList.add('hidden');
        }
    };
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (cancelChargeBtn) {
        cancelChargeBtn.addEventListener('click', closeModal);
    }
    
    // 点击弹窗外部关闭
    if (chargeConfirmModal) {
        chargeConfirmModal.addEventListener('click', (e) => {
            if (e.target === chargeConfirmModal) {
                closeModal();
            }
        });
    }
    
    // 确认充电
    if (confirmChargeBtn) {
        confirmChargeBtn.addEventListener('click', async () => {
            closeModal();
            await requestCharge();
        });
    }
    
    // 初始化状态显示
    updateTaskDisplay({
        taskId: '--',
        status: 'Unknown',
        progress: 0
    });
    
    // 初始化新页面
    initMapPage();
    initReservationPage();
    initPaymentPage();
    initRecommendationPage();
    initCommunityPage();
    
    // 绑定支付菜单项点击事件
    const paymentMenuItem = document.getElementById('payment-menu-item');
    if (paymentMenuItem) {
        paymentMenuItem.addEventListener('click', () => {
            const paymentPageNav = document.querySelector('[data-page="payment-page"]');
            if (paymentPageNav) {
                paymentPageNav.click();
            }
        });
    }
}

// 显示充电确认弹窗
function showChargeConfirmModal() {
    const location = document.getElementById('location').value;
    const vehicle = document.getElementById('vehicle').value;
    const chargeTypeElement = document.querySelector('input[name="charge-type"]:checked');
    const chargeType = chargeTypeElement ? chargeTypeElement.value : 'fast'; // 默认快充
    
    // 填充确认信息
    document.getElementById('confirm-location').textContent = location;
    document.getElementById('confirm-vehicle').textContent = vehicle;
    document.getElementById('confirm-charge-type').textContent = chargeType === 'fast' ? '快充' : '慢充';
    document.getElementById('confirm-estimated-time').textContent = chargeType === 'fast' ? '约30分钟' : '约2小时';
    
    // 计算并显示预计费用
    const estimatedPower = chargeType === 'fast' ? 15 : 10; // 快充约15kWh，慢充约10kWh
    const unitPrice = 1.2; // 每kWh价格
    const serviceFee = 5.0; // 服务费
    const estimatedCost = (estimatedPower * unitPrice + serviceFee).toFixed(2);
    document.getElementById('confirm-estimated-cost').textContent = `¥${estimatedCost}`;
    
    // 显示机器人状态
    const robotStatuses = ['可用', '即将返回', '充电中', '维护中'];
    const randomStatus = robotStatuses[Math.floor(Math.random() * robotStatuses.length)];
    const robotStatusElement = document.getElementById('confirm-robot-status');
    robotStatusElement.textContent = randomStatus;
    
    // 根据状态设置不同的颜色
    if (randomStatus === '可用') {
        robotStatusElement.style.color = 'var(--success-color)';
    } else if (randomStatus === '即将返回') {
        robotStatusElement.style.color = 'var(--warning-color)';
    } else {
        robotStatusElement.style.color = 'var(--error-color)';
    }
    
    // 显示弹窗
    document.getElementById('charge-confirm-modal').classList.remove('hidden');
}

// 页面加载完成后初始化
// document.addEventListener('DOMContentLoaded', initApp); // 已整合到下面的初始化代码中

// 模拟机器人移动和充电过程
function simulateChargingProcess() {
    const robotMarker = document.getElementById('robot-marker');
    const steps = ['step-dispatch', 'step-approach', 'step-docking', 'step-charging', 'step-complete'];
    let currentStep = 0;
    
    // 更新时间线步骤
    function updateStep(stepIndex) {
        // 标记之前的步骤为已完成
        for (let i = 0; i < stepIndex; i++) {
            document.getElementById(steps[i]).classList.add('completed');
            document.getElementById(steps[i]).classList.remove('active');
        }
        
        // 标记当前步骤为活动
        if (stepIndex < steps.length) {
            const currentStepElement = document.getElementById(steps[stepIndex]);
            currentStepElement.classList.add('active');
            currentStepElement.classList.remove('completed');
        }
    }
    
    // 步骤1: 派遣机器人
    updateStep(0);
    
    // 步骤2: 前往车辆 (5秒后)
    setTimeout(() => {
        updateStep(1);
        robotMarker.style.animation = 'robotMoveToCar 3s forwards';
        
        // 更新距离信息
        const distances = ['50米', '30米', '10米', '5米', '到达'];
        let distanceIndex = 0;
        const distanceInterval = setInterval(() => {
            document.getElementById('robot-distance').textContent = `距离车辆：${distances[distanceIndex]}`;
            distanceIndex++;
            if (distanceIndex >= distances.length) {
                clearInterval(distanceInterval);
            }
        }, 600);
        
        // 步骤3: 对接充电 (8秒后)
        setTimeout(() => {
            updateStep(2);
            if (robotMarker) robotMarker.style.animation = 'robotDocking 2s infinite alternate';
            
            // 步骤4: 充电中 (10秒后)
            setTimeout(() => {
                updateStep(3);
                if (robotMarker) robotMarker.style.animation = 'none';
                const stationIcon = document.querySelector('.station-icon');
                if (stationIcon) stationIcon.style.animation = 'chargingPulse 2s infinite';
                
                // 模拟充电进度更新
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += Math.random() * 5;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(progressInterval);
                        
                        // 步骤5: 充电完成
                        updateStep(4);
                        const stationIcon = document.querySelector('.station-icon');
                        if (stationIcon) stationIcon.style.animation = 'none';
                        
                        // 显示充电完成通知
                        showChargingCompleteNotification();
                    }
                    
                    // 更新进度显示
                    const progressBar = document.getElementById('task-progress');
                    const progressText = document.getElementById('progress-text');
                    const estimatedTimeElement = document.getElementById('estimated-time');
                    
                    if (progressBar && progressText && estimatedTimeElement) {
                        progressBar.style.setProperty('--progress', `${progress}%`);
                        progressText.textContent = `${Math.round(progress)}%`;
                        
                        // 更新剩余时间
                        const remainingMinutes = Math.round((100 - progress) * 0.3);
                        estimatedTimeElement.textContent = `${remainingMinutes} 分钟`;
                    }
                }, 1000);
            }, 3000);
        }, 5000);
    }, 2000);
}

// 显示充电完成通知
function showChargingCompleteNotification() {
    const notification = document.getElementById('charging-complete-notification');
    notification.classList.remove('hidden');
    
    // 播放完成音效（可选）
    playCompletionSound();
    
    // 绑定按钮事件
    const viewBillBtn = document.getElementById('view-bill-btn');
    const laterPayBtn = document.getElementById('later-pay-btn');
    
    // 查看账单按钮 - 跳转到支付页面
    viewBillBtn.onclick = () => {
        // 生成账单数据
        generateBillData();
        // 跳转到支付页面
        const paymentPageBtn = document.querySelector('[data-page="payment-page"]');
        if (paymentPageBtn) paymentPageBtn.click();
    };
    
    // 稍后支付按钮
    laterPayBtn.onclick = () => {
        // 隐藏通知
        notification.classList.add('hidden');
        // 显示提示信息
        showMessage(document.getElementById('status-container'), '您可以在个人中心 > 支付与计费中完成支付', true);
    };
}

// 播放完成音效（模拟）
function playCompletionSound() {
    // 在实际应用中，这里可以播放音效
    console.log('充电完成音效播放');
}

// 生成账单数据
function generateBillData() {
    // 模拟生成账单数据
    const duration = Math.floor(Math.random() * 60) + 30; // 30-90分钟
    const power = (Math.random() * 20 + 10).toFixed(1); // 10-30kWh
    const serviceFee = 5.0;
    const unitPrice = 1.2; // 每kWh价格
    const electricityCost = (power * unitPrice).toFixed(2);
    const totalCost = (parseFloat(electricityCost) + serviceFee).toFixed(2);
    
    // 更新支付页面数据
    document.getElementById('charging-duration').textContent = `${Math.floor(duration / 60)}小时${duration % 60}分钟`;
    document.getElementById('charging-power').textContent = `${power} kWh`;
    document.getElementById('unit-price').textContent = `¥${unitPrice.toFixed(2)}/kWh`;
    document.getElementById('electricity-cost').textContent = `¥${electricityCost}`;
    document.getElementById('service-fee').textContent = `¥${serviceFee.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `¥${totalCost}`;
    
    // 检查是否启用无感支付
    const autopayEnabled = localStorage.getItem('autopayEnabled') === 'true';
    if (autopayEnabled) {
        // 自动处理支付
        setTimeout(() => {
            processAutoPayment(totalCost);
        }, 1000);
    }
}

// 处理无感支付
function processAutoPayment(amount) {
    // 模拟自动支付处理
    showMessage(document.getElementById('payment-page'), `无感支付成功：¥${amount}`, true);
    
    // 添加到支付历史
    addPaymentHistory({
        date: new Date().toLocaleString(),
        station: document.getElementById('charging-duration').textContent,
        amount: amount,
        method: '无感支付'
    });
}

// 添加支付历史记录
function addPaymentHistory(payment) {
    const paymentList = document.getElementById('payment-list');
    const paymentItem = document.createElement('div');
    paymentItem.className = 'payment-item';
    paymentItem.innerHTML = `
        <div class="payment-info">
            <div class="payment-date">${payment.date}</div>
            <div class="payment-station">${payment.station}</div>
        </div>
        <div class="payment-amount">¥${payment.amount}</div>
    `;
    paymentList.insertBefore(paymentItem, paymentList.firstChild);
}

// 显示发票申请弹窗
function showInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    modal.classList.remove('hidden');
    
    // 绑定事件
    const closeBtn = document.getElementById('close-invoice-modal-btn');
    const cancelBtn = document.getElementById('cancel-invoice-btn');
    const submitBtn = document.getElementById('submit-invoice-btn');
    const invoiceType = document.getElementById('invoice-type');
    const taxNumberGroup = document.getElementById('tax-number-group');
    
    // 关闭弹窗
    const closeModal = () => {
        modal.classList.add('hidden');
    };
    
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    
    // 点击弹窗外部关闭
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // 发票类型变化事件
    invoiceType.onchange = () => {
        if (invoiceType.value === 'company') {
            taxNumberGroup.style.display = 'block';
        } else {
            taxNumberGroup.style.display = 'none';
        }
    };
    
    // 提交发票申请
    submitBtn.onclick = async () => {
        const invoiceTypeValue = invoiceType.value;
        const invoiceTitle = document.getElementById('invoice-title').value;
        const taxNumber = document.getElementById('tax-number').value;
        const invoiceEmail = document.getElementById('invoice-email').value;
        const invoicePhone = document.getElementById('invoice-phone').value;
        
        // 表单验证
        if (!invoiceTitle) {
            showMessage(modal, '请输入发票抬头', false);
            return;
        }
        
        if (invoiceTypeValue === 'company' && !taxNumber) {
            showMessage(modal, '企业发票请填写税号', false);
            return;
        }
        
        if (!invoiceEmail) {
            showMessage(modal, '请输入接收邮箱', false);
            return;
        }
        
        // 提交发票申请
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
            
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            closeModal();
            showMessage(document.getElementById('payment-page'), '发票申请已提交，将在1-3个工作日内发送至您的邮箱', true);
        } catch (error) {
            showMessage(modal, '提交失败，请重试', false);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交申请';
        }
    };
}

// 地图功能
async function initMapPage() {
    // 获取充电站数据
    chargingStations = await ApiService.getChargingStations();
    
    // 初始化地图控件
    initMapControls();
    
    // 初始化标记点击事件
    initMarkerEvents();
    
    // 初始化地图工具栏
    initMapToolbar();
    
    // 更新地图信息栏
    updateMapInfoBar();
    
    // 初始化详情面板
    initDetailsPanel();
    
    // 初始化导航面板
    initNavigationPanel();
    
    // 初始化实时数据面板
    initRealtimeDataPanel();
    
    // 初始化地图搜索和筛选功能
    initMapSearchAndFilter();
    
    // 地图性能优化器已通过全局性能优化器初始化
    if (globalOptimizer && window.mapOptimizer) {
        console.log('地图性能优化器已通过全局优化器初始化');
    }
    
    // 搜索功能
    const searchBtn = document.getElementById('search-btn');
    const locationSearch = document.getElementById('location-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const searchTerm = locationSearch ? locationSearch.value.trim() : '';
            if (searchTerm) {
                try {
                    const searchResults = await ApiService.searchStations(searchTerm);
                    // 更新地图显示搜索结果
                    updateMapMarkers(searchResults);
                    showMessage(requestMessage, `找到${searchResults.length}个匹配的充电站`, true);
                } catch (error) {
                    showMessage(requestMessage, '搜索失败，请重试', false);
                }
            }
        });
    }
    
    // 筛选功能
    const availableOnlyCheckbox = document.getElementById('available-only');
    const fastChargingCheckbox = document.getElementById('fast-charging');
    const showRobotsCheckbox = document.getElementById('show-robots');
    
    if (availableOnlyCheckbox) {
        availableOnlyCheckbox.addEventListener('change', () => filterMapElements());
    }
    if (fastChargingCheckbox) {
        fastChargingCheckbox.addEventListener('change', () => filterMapElements());
    }
    if (showRobotsCheckbox) {
        showRobotsCheckbox.addEventListener('change', () => filterMapElements());
    }
    
    function filterMapElements() {
        const showAvailableOnly = availableOnlyCheckbox.checked;
        const showFastCharging = fastChargingCheckbox.checked;
        const showRobots = showRobotsCheckbox.checked;
        
        // 筛选充电站
        const stationMarkers = document.querySelectorAll('.map-marker[data-type="station"]');
        stationMarkers.forEach(marker => {
            const stationId = parseInt(marker.getAttribute('data-id'));
            const station = chargingStations.find(s => s.id === stationId);
            
            let shouldShow = true;
            
            if (showAvailableOnly && station.available === 0) {
                shouldShow = false;
            }
            
            if (showFastCharging && !station.fast) {
                shouldShow = false;
            }
            
            marker.style.display = shouldShow ? 'flex' : 'none';
        });
        
        // 筛选机器人
        const robotMarkers = document.querySelectorAll('.map-marker[data-type="robot"]');
        robotMarkers.forEach(marker => {
            marker.style.display = showRobots ? 'flex' : 'none';
        });
        
        // 更新信息栏
        updateMapInfoBar();
    }
}

// 初始化地图控件
function initMapControls() {
    // 地图缩放控制
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const mapContainer = document.getElementById('charging-map');
    
    if (zoomInBtn && zoomOutBtn && mapContainer) {
        let currentZoom = 1;
        let minZoom = 0.6;
        let maxZoom = 2;
        let zoomStep = 0.2;
        
        // 缩放函数
        function setZoom(zoomLevel, showNotification = true) {
            // 记录交互开始时间（用于性能监控）
            const interactionStartTime = performance.now();
            
            zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel));
            currentZoom = zoomLevel;
            mapContainer.style.transform = `scale(${currentZoom})`;
            
            // 更新缩放级别指示器
            const zoomIndicator = document.getElementById('zoom-indicator');
            if (zoomIndicator) {
                zoomIndicator.textContent = `${Math.round(currentZoom * 100)}%`;
            }
            
            // 更新标记位置以适应新的缩放级别
            if (typeof mapOptimizer !== 'undefined' && mapOptimizer && mapOptimizer.updateMarkerPositions) {
                mapOptimizer.updateMarkerPositions();
            }
            
            // 更新性能指标
            if (globalOptimizer) {
                globalOptimizer.recordInteractionTime('map-zoom', interactionStartTime);
            }
            
            if (typeof mapOptimizer !== 'undefined' && mapOptimizer) {
                mapOptimizer.metrics.interactionTime = performance.now() - interactionStartTime;
            }
            
            if (showNotification) {
                showMessage(requestMessage, `地图缩放: ${Math.round(currentZoom * 100)}%`, true, 'info');
            }
        }
        
        // 缩放按钮事件
        zoomInBtn.addEventListener('click', () => {
            setZoom(currentZoom + zoomStep);
        });
        
        zoomOutBtn.addEventListener('click', () => {
            setZoom(currentZoom - zoomStep);
        });
        
        // 触摸缩放支持
        let initialDistance = 0;
        let initialZoom = 1;
        
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // 计算两指之间的初始距离
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                initialZoom = currentZoom;
            }
        }, { passive: true });
        
        mapContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                
                // 计算当前两指之间的距离
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                // 计算缩放比例
                const scale = currentDistance / initialDistance;
                const newZoom = initialZoom * scale;
                
                // 应用缩放
                setZoom(newZoom, false);
            }
        }, { passive: false });
        
        // 鼠标滚轮缩放支持
        mapContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
            setZoom(currentZoom + delta);
        }, { passive: false });
        
        // 双击缩放支持
        let lastTapTime = 0;
        mapContainer.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                // 双击检测
                e.preventDefault();
                
                // 根据当前缩放级别决定是放大还是缩小
                if (currentZoom <= 1.2) {
                    setZoom(currentZoom + 0.5);
                } else {
                    setZoom(1); // 重置到默认缩放
                }
            }
            
            lastTapTime = currentTime;
        }, { passive: false });
    }
    
    // 定位到当前位置
    const locationBtn = document.getElementById('location-btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            // 模拟定位到当前位置
            const currentLocation = document.querySelector('.current-location');
            if (currentLocation) {
                // 添加脉冲动画效果
                const locationAccuracy = currentLocation.querySelector('.location-accuracy');
                if (locationAccuracy) {
                    locationAccuracy.style.animation = 'none';
                    setTimeout(() => {
                        locationAccuracy.style.animation = 'pulse 1s 3';
                    }, 10);
                }
                
                // 显示定位成功消息
                showMessage(requestMessage, '已定位到您的当前位置', true, 'info');
            }
        });
    }
    
    // 图层切换
    const layerBtn = document.getElementById('layer-btn');
    const layerSelector = document.getElementById('layer-selector');
    const layerOptions = document.querySelectorAll('.layer-option');
    
    if (layerBtn && layerSelector) {
        layerBtn.addEventListener('click', () => {
            layerSelector.classList.toggle('hidden');
        });
    }
    
    // 为每个图层选项添加点击事件
    if (layerOptions) {
        layerOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 移除所有选项的active类
                layerOptions.forEach(opt => opt.classList.remove('active'));
                // 添加当前选项的active类
                option.classList.add('active');
                
                // 获取选中的图层值
                const radioInput = option.querySelector('input[type="radio"]');
                if (radioInput) {
                    const selectedLayer = radioInput.value;
                    changeMapLayer(selectedLayer);
                }
                
                // 隐藏图层选择器
                if (layerSelector) {
                    layerSelector.classList.add('hidden');
                }
            });
        });
    }
    
    // 地图拖拽功能
    initMapDrag(mapContainer);
    
    // 初始化地图图层
    initMapLayers();
}

// 切换地图图层
function changeMapLayer(layerType) {
    const mapContainer = document.getElementById('charging-map');
    if (!mapContainer) return;
    
    // 根据不同图层类型设置不同的背景样式
    switch (layerType) {
        case 'standard':
            mapContainer.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
            showMessage(requestMessage, '已切换到标准地图', true, 'info');
            break;
        case 'satellite':
            mapContainer.style.background = 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)';
            showMessage(requestMessage, '已切换到卫星地图', true, 'info');
            break;
        case 'traffic':
            mapContainer.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #fff3e0 50%, #ffebee 100%)';
            showMessage(requestMessage, '已切换到交通地图', true, 'info');
            break;
        case 'night':
            mapContainer.style.background = 'linear-gradient(135deg, #121212 0%, #263238 50%, #37474f 100%)';
            showMessage(requestMessage, '已切换到夜间地图', true, 'info');
            break;
        default:
            mapContainer.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
            showMessage(requestMessage, '已切换到标准地图', true, 'info');
    }
}

// 性能优化：预加载关键资源
function preloadCriticalResources() {
    // 预加载关键图片
    const criticalImages = [
        // 图片文件暂时注释掉，避免404错误
        // 'images/station-icon.png',
        // 'images/robot-icon.png',
        // 'images/user-avatar.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
    
    // 预加载关键字体
    const criticalFonts = [
        // 字体文件暂时注释掉，避免404错误
        // 'fonts/main-font.woff2'
    ];
    
    criticalFonts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = src;
        document.head.appendChild(link);
    });
}

// 性能优化：懒加载非关键资源
function lazyLoadNonCriticalResources() {
    // 使用Intersection Observer实现图片懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // 观察所有带有data-src属性的图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// 性能优化：减少重绘和回流
function optimizeRendering() {
    // 批量DOM操作
    const batchDOMUpdates = (updates) => {
        // 使用DocumentFragment减少重绘
        const fragment = document.createDocumentFragment();
        
        updates.forEach(update => {
            if (update.type === 'add') {
                const element = document.createElement(update.element);
                if (update.content) element.textContent = update.content;
                if (update.className) element.className = update.className;
                fragment.appendChild(element);
            }
        });
        
        // 一次性添加到DOM
        if (updates.length > 0 && updates[0].parent) {
            updates[0].parent.appendChild(fragment);
        }
    };
    
    // 使用CSS类代替直接样式操作
    const toggleClass = (element, className, force) => {
        if (force === undefined) {
            element.classList.toggle(className);
        } else if (force) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    };
    
    // 避免强制同步布局
    const avoidForcedSynchronousLayout = () => {
        // 先读取所有需要读取的属性
        const elements = document.querySelectorAll('.station-item');
        const heights = Array.from(elements).map(el => el.offsetHeight);
        
        // 然后再进行修改
        elements.forEach((el, index) => {
            el.style.marginTop = `${heights[index] * 0.5}px`;
        });
    };
    
    return {
        batchDOMUpdates,
        toggleClass,
        avoidForcedSynchronousLayout
    };
}

// 性能优化：内存管理
function optimizeMemoryUsage() {
    // 清理事件监听器
    const cleanupEventListeners = () => {
        // 移除所有事件监听器
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const clone = element.cloneNode(true);
            element.parentNode.replaceChild(clone, element);
        });
    };
    
    // 清理定时器
    const cleanupTimers = () => {
        const highestTimerId = setTimeout(() => {}, 0);
        for (let i = 1; i <= highestTimerId; i++) {
            clearTimeout(i);
        }
    };
    
    // 清理DOM引用
    const cleanupDOMReferences = () => {
        // 清理全局变量中的DOM引用
        if (window.tempElements) {
            window.tempElements = null;
        }
    };
    
    return {
        cleanupEventListeners,
        cleanupTimers,
        cleanupDOMReferences
    };
}

// 性能优化：预加载关键资源 - 全局函数
function preloadCriticalResources() {
    // 预加载关键图片
    const criticalImages = [
        // 图片文件暂时注释掉，避免404错误
        // 'images/station-icon.png',
        // 'images/robot-icon.png',
        // 'images/user-avatar.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
    
    // 预加载关键字体
    const criticalFonts = [
        // 字体文件暂时注释掉，避免404错误
        // 'fonts/main-font.woff2'
    ];
    
    criticalFonts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = src;
        document.head.appendChild(link);
    });
}

// 性能优化：懒加载非关键资源 - 全局函数
function lazyLoadNonCriticalResources() {
    // 使用Intersection Observer实现图片懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // 观察所有带有data-src属性的图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// 性能优化：减少重绘和回流 - 全局函数
function optimizeRendering() {
    // 批量DOM操作
    const batchDOMUpdates = (updates) => {
        // 使用DocumentFragment减少重绘
        const fragment = document.createDocumentFragment();
        
        updates.forEach(update => {
            if (update.type === 'add') {
                const element = document.createElement(update.element);
                if (update.content) element.textContent = update.content;
                if (update.className) element.className = update.className;
                fragment.appendChild(element);
            }
        });
        
        // 一次性添加到DOM
        if (updates.length > 0 && updates[0].parent) {
            updates[0].parent.appendChild(fragment);
        }
    };
    
    // 使用CSS类代替直接样式操作
    const toggleClass = (element, className, force) => {
        if (force === undefined) {
            element.classList.toggle(className);
        } else if (force) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    };
    
    // 避免强制同步布局
    const avoidForcedSynchronousLayout = () => {
        // 先读取所有需要读取的属性
        const elements = document.querySelectorAll('.station-item');
        const heights = Array.from(elements).map(el => el.offsetHeight);
        
        // 然后再进行修改
        elements.forEach((el, index) => {
            el.style.marginTop = `${heights[index] * 0.5}px`;
        });
    };
    
    return {
        batchDOMUpdates,
        toggleClass,
        avoidForcedSynchronousLayout
    };
}

// 性能优化：内存管理 - 全局函数
function optimizeMemoryUsage() {
    // 清理不再使用的事件监听器
    const cleanupEventListeners = () => {
        // 这里可以添加清理逻辑
        console.log('清理事件监听器');
    };
    
    // 定期执行内存清理
    setInterval(cleanupEventListeners, 5 * 60 * 1000); // 每5分钟清理一次
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        // 清理定时器
        const highestTimeoutId = setTimeout(() => {});
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
        
        // 清理事件监听器
        cleanupEventListeners();
    });
}

// 性能监控面板功能 - 全局函数
function initPerformancePanel() {
    const performancePanel = document.getElementById('performance-panel');
    const performanceToggle = document.getElementById('performance-toggle');
    const closePanelBtn = document.getElementById('close-performance-panel');
    const clearMetricsBtn = document.getElementById('clear-metrics');
    const exportMetricsBtn = document.getElementById('export-metrics');
    
    // 切换性能面板显示状态
    const togglePerformancePanel = () => {
        performancePanel.classList.toggle('visible');
    };
    
    // 更新性能面板数据
    window.updatePerformancePanel = function() {
        if (!performancePanel || !performancePanel.classList.contains('visible')) {
            return;
        }
        
        // 获取性能报告
        const report = performanceMonitor.getPerformanceReport();
        
        // 更新页面加载时间
        const pageLoadTimeEl = document.getElementById('page-load-time');
        if (pageLoadTimeEl) {
            pageLoadTimeEl.textContent = report.avgPageLoadTime > 0 
                ? `${report.avgPageLoadTime}ms` 
                : '--';
        }
        
        // 更新API响应时间
        const apiResponseTimeEl = document.getElementById('api-response-time');
        if (apiResponseTimeEl) {
            apiResponseTimeEl.textContent = report.avgApiResponseTime > 0 
                ? `${report.avgApiResponseTime}ms` 
                : '--';
        }
        
        // 更新内存使用情况
        const memoryUsageEl = document.getElementById('memory-usage');
        if (memoryUsageEl && performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize;
            const totalMemory = performance.memory.totalJSHeapSize;
            const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);
            memoryUsageEl.textContent = `${memoryPercentage}%`;
        } else if (memoryUsageEl) {
            memoryUsageEl.textContent = 'N/A';
        }
        
        // 更新错误计数
        const errorCountEl = document.getElementById('error-count');
        if (errorCountEl) {
            const totalErrors = Object.values(report.errorCounts).reduce((sum, count) => sum + count, 0);
            errorCountEl.textContent = totalErrors.toString();
        }
    };
    
    // 清除性能指标数据
    const clearMetrics = () => {
        if (confirm('确定要清除所有性能指标数据吗？')) {
            performanceMonitor.metrics = {
                apiResponseTimes: [],
                pageLoadTimes: [],
                errorCounts: {},
                lastCleanup: Date.now()
            };
            updatePerformancePanel();
            alert('性能指标数据已清除');
        }
    };
    
    // 导出性能报告
    const exportMetrics = () => {
        const report = performanceMonitor.getPerformanceReport();
        const reportText = `
性能监控报告
生成时间: ${new Date().toLocaleString()}

页面加载时间: ${report.avgPageLoadTime}ms
API响应时间: ${report.avgApiResponseTime}ms
API调用次数: ${report.totalApiCalls}
页面加载次数: ${report.totalPageLoads}

错误统计:
${Object.entries(report.errorCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}
        `;
        
        // 创建下载链接
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    // 绑定事件监听器
    if (performanceToggle) {
        performanceToggle.addEventListener('click', togglePerformancePanel);
    }
    
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', togglePerformancePanel);
    }
    
    if (clearMetricsBtn) {
        clearMetricsBtn.addEventListener('click', clearMetrics);
    }
    
    if (exportMetricsBtn) {
        exportMetricsBtn.addEventListener('click', exportMetrics);
    }
    
    // 定期更新性能面板数据
    setInterval(updatePerformancePanel, 1000);
}

// 初始化地图拖拽功能
function initMapDrag(mapContainer) {
    if (!mapContainer) return;
    
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    let lastTouchTime = 0;
    
    // 节流函数 - 限制拖拽事件的触发频率
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // 开始拖拽
    function startDrag(e) {
        e.preventDefault();
        
        if (e.type === 'touchstart') {
            const touch = e.touches[0];
            startX = touch.clientX - mapContainer.offsetLeft;
            startY = touch.clientY - mapContainer.offsetTop;
        } else {
            startX = e.clientX - mapContainer.offsetLeft;
            startY = e.clientY - mapContainer.offsetTop;
        }
        
        isDragging = true;
        lastTouchTime = Date.now();
        
        // 添加拖拽中的样式
        mapContainer.classList.add('dragging');
    }
    
    // 处理拖拽移动的函数
    function handleDragMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // 记录交互开始时间（用于性能监控）
        const interactionStartTime = performance.now();
        
        let clientX, clientY;
        
        // 兼容鼠标和触摸事件
        if (e.type === 'mousemove') {
            clientX = e.pageX;
            clientY = e.pageY;
        } else if (e.type === 'touchmove') {
            clientX = e.touches[0].pageX;
            clientY = e.touches[0].pageY;
        }
        
        const x = clientX - mapContainer.offsetLeft;
        const y = clientY - mapContainer.offsetTop;
        
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        
        const parent = mapContainer.parentElement;
        parent.scrollLeft = scrollLeft - walkX;
        parent.scrollTop = scrollTop - walkY;
        
        // 更新性能指标
        if (typeof mapOptimizer !== 'undefined' && mapOptimizer) {
            mapOptimizer.metrics.interactionTime = performance.now() - interactionStartTime;
        }
    }
    
    // 开始拖拽
    function startDrag(e) {
        // 只在地图容器上启用拖拽，不干扰其他交互元素
        if (e.target === mapContainer || e.target.classList.contains('map-background')) {
            isDragging = true;
            mapContainer.style.cursor = 'grabbing';
            
            // 兼容鼠标和触摸事件
            if (e.type === 'mousedown') {
                startX = e.pageX - mapContainer.offsetLeft;
                startY = e.pageY - mapContainer.offsetTop;
            } else if (e.type === 'touchstart') {
                // 检测双指缩放
                if (e.touches.length === 2) {
                    isDragging = false;
                    return;
                }
                
                startX = e.touches[0].pageX - mapContainer.offsetLeft;
                startY = e.touches[0].pageY - mapContainer.offsetTop;
                
                // 记录触摸时间，用于区分点击和长按
                lastTouchTime = Date.now();
            }
            
            // 获取当前滚动位置
            const parent = mapContainer.parentElement;
            scrollLeft = parent.scrollLeft;
            scrollTop = parent.scrollTop;
            
            e.preventDefault();
        }
    }
    
    // 结束拖拽
    function endDrag(e) {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    }
    
    // 鼠标事件
    mapContainer.addEventListener('mousedown', startDrag);
    mapContainer.addEventListener('mousemove', throttle(handleDragMove, 16)); // 约60fps
    mapContainer.addEventListener('mouseup', endDrag);
    mapContainer.addEventListener('mouseleave', endDrag);
    
    // 触摸事件 - 移动设备支持
    mapContainer.addEventListener('touchstart', startDrag, { passive: false });
    mapContainer.addEventListener('touchmove', throttle(handleDragMove, 16), { passive: false });
    mapContainer.addEventListener('touchend', endDrag);
    mapContainer.addEventListener('touchcancel', endDrag);
    
    // 防止触摸时页面滚动
    mapContainer.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault();
        }
    }, { passive: false });
}

// 初始化地图图层
function initMapLayers() {
    // 创建不同图层的背景元素
    const mapContainer = document.getElementById('charging-map');
    if (!mapContainer) return;
    
    // 添加地图背景
    const mapBackground = document.createElement('div');
    mapBackground.className = 'map-background';
    mapBackground.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
        z-index: -1;
        cursor: grab;
    `;
    
    mapContainer.appendChild(mapBackground);
}

// 初始化标记点击事件
function initMarkerEvents() {
    const markers = document.querySelectorAll('.map-marker');
    
    markers.forEach(marker => {
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 移除其他标记的活动状态
            markers.forEach(m => m.classList.remove('active'));
            
            // 设置当前标记为活动状态
            marker.classList.add('active');
            
            // 获取标记信息
            const markerType = marker.getAttribute('data-type');
            const markerId = marker.getAttribute('data-id');
            
            if (markerType === 'station') {
                showStationDetails(markerId);
            } else if (markerType === 'robot') {
                showRobotDetails(markerId);
            }
        });
        
        // 添加弹窗按钮事件
        const popupBtns = marker.querySelectorAll('.popup-btn');
        popupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const action = btn.textContent;
                const markerType = marker.getAttribute('data-type');
                const markerId = marker.getAttribute('data-id');
                
                if (markerType === 'station') {
                    handleStationAction(action, markerId, marker);
                } else if (markerType === 'robot') {
                    handleRobotAction(action, markerId);
                }
            });
        });
    });
    
    // 点击地图空白处取消活动状态
    const mapContainer = document.getElementById('charging-map');
    if (mapContainer) {
        mapContainer.addEventListener('click', () => {
            markers.forEach(m => m.classList.remove('active'));
        });
    }
}

// 初始化地图工具栏
function initMapToolbar() {
    // 工具栏按钮已在initMapControls中处理
}

// 更新地图信息栏
function updateMapInfoBar() {
    const stationCount = document.getElementById('station-count');
    const robotCount = document.getElementById('robot-count');
    const distanceValue = document.getElementById('distance-value');
    
    // 计算可用充电站数量
    const stationMarkers = document.querySelectorAll('.map-marker[data-type="station"]:not(.busy)');
    if (stationCount) {
        stationCount.textContent = stationMarkers.length;
    }
    
    // 计算空闲机器人数量
    const robotMarkers = document.querySelectorAll('.map-marker[data-type="robot"]:not(.busy)');
    if (robotCount) {
        robotCount.textContent = robotMarkers.length;
    }
    
    // 更新距离信息（模拟）
    if (distanceValue) {
        distanceValue.textContent = '150m';
    }
}

// 初始化详情面板
function initDetailsPanel() {
    const closePanelBtn = document.getElementById('close-panel-btn');
    const detailsPanel = document.getElementById('station-details-panel');
    
    if (closePanelBtn && detailsPanel) {
        closePanelBtn.addEventListener('click', () => {
            detailsPanel.style.display = 'none';
        });
    }
}

// 显示充电站详情
async function showStationDetails(stationId) {
    try {
        const station = await ApiService.getStationDetails(stationId);
        const detailsPanel = document.getElementById('station-details-panel');
        const panelTitle = document.getElementById('detail-panel-title');
        const panelContent = document.getElementById('detail-panel-content');
        
        if (detailsPanel && panelTitle && panelContent) {
            panelTitle.textContent = station.name;
            
            panelContent.innerHTML = `
                <div class="station-detail-info">
                    <div class="detail-row">
                        <span class="detail-label">状态：</span>
                        <span class="detail-value ${station.available > 0 ? 'status-available' : 'status-unavailable'}">
                            ${station.available > 0 ? '可用' : '繁忙'}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">可用桩位：</span>
                        <span class="detail-value">${station.available}/${station.total}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">充电类型：</span>
                        <span class="detail-value">${station.fast ? '快充/慢充' : '仅慢充'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">价格：</span>
                        <span class="detail-value">¥${station.price}/度</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">地址：</span>
                        <span class="detail-value">${station.address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">距离：</span>
                        <span class="detail-value">约${station.distance}米</span>
                    </div>
                    ${station.waitTime > 0 ? `
                    <div class="detail-row">
                        <span class="detail-label">预计等待：</span>
                        <span class="detail-value">${station.waitTime}分钟</span>
                    </div>
                    ` : ''}
                    <div class="detail-actions">
                        <button class="primary-btn" data-station-id="${station.id}" data-station-name="${station.name}">选择此充电站</button>
                        <button class="secondary-btn" id="navigate-btn">导航前往</button>
                    </div>
                </div>
            `;
            
            detailsPanel.style.display = 'block';
            
            // 添加选择按钮事件
            const selectBtn = panelContent.querySelector('.primary-btn');
            selectBtn.addEventListener('click', () => {
                // 更新充电页面的位置选择
                const locationSelect = document.getElementById('location');
                if (locationSelect) {
                    const option = document.createElement('option');
                    option.value = station.name;
                    option.textContent = station.name;
                    option.selected = true;
                    locationSelect.appendChild(option);
                }
                
                // 切换到充电页面
                const requestPageBtn = document.querySelector('[data-page="request-page"]');
                if (requestPageBtn) requestPageBtn.click();
                if (requestMessage) showMessage(requestMessage, `已选择${station.name}`, true);
            });
            
            // 添加导航按钮事件
            const navigateBtn = panelContent.querySelector('#navigate-btn');
            navigateBtn.addEventListener('click', () => {
                showNavigationPath(stationId);
            });
        }
    } catch (error) {
        showMessage(requestMessage, '获取充电站详情失败', false);
    }
}

// 显示机器人详情
function showRobotDetails(robotId) {
    // 模拟机器人数据
    const robotData = {
        'robot-1': {
            id: 'robot-1',
            name: '移动充电机器人 #01',
            battery: 85,
            status: '空闲',
            serviceRange: 500,
            location: 'A区停车场'
        },
        'robot-2': {
            id: 'robot-2',
            name: '移动充电机器人 #02',
            battery: 62,
            status: '服务中',
            serviceRange: 500,
            location: 'B区充电站',
            target: 'B区充电站',
            estimatedTime: 25
        }
    };
    
    const robot = robotData[robotId];
    if (!robot) return;
    
    const detailsPanel = document.getElementById('station-details-panel');
    const panelTitle = document.getElementById('detail-panel-title');
    const panelContent = document.getElementById('detail-panel-content');
    
    if (detailsPanel && panelTitle && panelContent) {
        panelTitle.textContent = robot.name;
        
        panelContent.innerHTML = `
            <div class="robot-detail-info">
                <div class="detail-row">
                    <span class="detail-label">状态：</span>
                    <span class="detail-value ${robot.status === '空闲' ? 'status-available' : 'status-busy'}">
                        ${robot.status}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">电量：</span>
                    <span class="detail-value">${robot.battery}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">服务范围：</span>
                    <span class="detail-value">${robot.serviceRange}米</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">当前位置：</span>
                    <span class="detail-value">${robot.location}</span>
                </div>
                ${robot.target ? `
                <div class="detail-row">
                    <span class="detail-label">目标位置：</span>
                    <span class="detail-value">${robot.target}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">预计完成：</span>
                    <span class="detail-value">${robot.estimatedTime}分钟</span>
                </div>
                ` : ''}
                <div class="detail-actions">
                    ${robot.status === '空闲' ? 
                        `<button class="primary-btn" id="summon-robot-btn" data-robot-id="${robot.id}">召唤机器人</button>` : 
                        `<button class="secondary-btn" id="view-robot-status-btn" data-robot-id="${robot.id}">查看状态</button>`
                    }
                </div>
            </div>
        `;
        
        detailsPanel.style.display = 'block';
        
        // 添加召唤机器人按钮事件
        const summonBtn = panelContent.querySelector('#summon-robot-btn');
        if (summonBtn) {
            summonBtn.addEventListener('click', () => {
                summonRobot(robot.id);
            });
        }
        
        // 添加查看状态按钮事件
        const viewStatusBtn = panelContent.querySelector('#view-robot-status-btn');
        if (viewStatusBtn) {
            viewStatusBtn.addEventListener('click', () => {
                showMessage(requestMessage, `正在查看${robot.name}的实时状态`, true, 'info');
            });
        }
    }
}

// 处理充电站操作
function handleStationAction(action, stationId, markerElement) {
    const stationName = markerElement.querySelector('.popup-header h4').textContent;
    
    switch (action) {
        case '导航':
            showNavigationPath(stationId);
            break;
        case '详情':
            showStationDetails(stationId);
            break;
    }
}

// 处理机器人操作
function handleRobotAction(action, robotId) {
    switch (action) {
        case '召唤':
            summonRobot(robotId);
            break;
        case '详情':
            showRobotDetails(robotId);
            break;
        case '查看详情':
            showRobotDetails(robotId);
            break;
    }
}

// 显示导航路径
// 显示导航面板和路径
function showNavigationPath(stationId) {
    // 获取充电站信息
    const station = chargingStations.find(s => s.id === parseInt(stationId));
    if (!station) return;
    
    // 显示导航面板
    const navigationPanel = document.getElementById('navigation-panel');
    if (navigationPanel) {
        // 设置目的地信息
        const destinationName = document.getElementById('nav-destination-name');
        const destinationAddress = document.getElementById('nav-destination-address');
        
        if (destinationName) destinationName.textContent = station.name;
        if (destinationAddress) destinationAddress.textContent = station.address || '地址信息获取中...';
        
        // 设置导航摘要信息
        const navDistance = document.getElementById('nav-distance');
        const navEstimatedTime = document.getElementById('nav-estimated-time');
        const navTrafficStatus = document.getElementById('nav-traffic-status');
        
        if (navDistance) navDistance.textContent = station.distance || '约150米';
        if (navEstimatedTime) navEstimatedTime.textContent = station.estimatedTime || '约5分钟';
        if (navTrafficStatus) navTrafficStatus.textContent = station.trafficStatus || '畅通';
        
        // 设置路线选项
        const recommendedTime = document.getElementById('route-recommended-time');
        const recommendedDistance = document.getElementById('route-recommended-distance');
        const alternativeTime = document.getElementById('route-alternative-time');
        const alternativeDistance = document.getElementById('route-alternative-distance');
        
        if (recommendedTime) recommendedTime.textContent = station.estimatedTime || '5分钟';
        if (recommendedDistance) recommendedDistance.textContent = station.distance || '150米';
        if (alternativeTime) alternativeTime.textContent = station.alternativeTime || '8分钟';
        if (alternativeDistance) alternativeDistance.textContent = station.alternativeDistance || '200米';
        
        // 设置导航步骤
        updateNavigationSteps(stationId);
        
        // 显示面板
        navigationPanel.classList.add('active');
        
        // 在地图上显示路径
        drawRouteOnMap(stationId);
    }
}

// 在地图上绘制路径
function drawRouteOnMap(stationId) {
    const mapRoute = document.getElementById('map-route');
    const routePath = document.getElementById('route-path');
    
    if (mapRoute && routePath) {
        // 获取当前位置和目标位置
        const currentLocation = document.querySelector('.current-location');
        const targetMarker = document.querySelector(`.map-marker[data-id="${stationId}"]`);
        
        if (currentLocation && targetMarker) {
            // 获取位置坐标
            const currentRect = currentLocation.getBoundingClientRect();
            const targetRect = targetMarker.getBoundingClientRect();
            const mapRect = document.getElementById('charging-map').getBoundingClientRect();
            
            // 计算相对位置
            const startX = currentRect.left - mapRect.left + currentRect.width / 2;
            const startY = currentRect.top - mapRect.top + currentRect.height / 2;
            const endX = targetRect.left - mapRect.left + targetMarker.width / 2;
            const endY = targetRect.top - mapRect.top + targetMarker.height / 2;
            
            // 创建曲线路径（更自然的路径）
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const controlX = midX + (endY - startY) / 4; // 添加曲线效果
            const controlY = midY - (endX - startX) / 4;
            
            const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
            routePath.setAttribute('d', pathData);
            
            // 显示路径
            mapRoute.style.display = 'block';
        }
    }
}

// 更新导航步骤
function updateNavigationSteps(stationId) {
    const station = chargingStations.find(s => s.id === parseInt(stationId));
    if (!station) return;
    
    const turnByTurnNav = document.getElementById('turn-by-turn-nav');
    if (!turnByTurnNav) return;
    
    // 根据充电站生成导航步骤
    let steps = [];
    
    // 起点步骤
    steps.push({
        icon: '🚶',
        instruction: '从当前位置出发',
        distance: '起点'
    });
    
    // 根据充电站位置添加中间步骤
    if (stationId === '1') { // A区充电站
        steps.push({
            icon: '➡️',
            instruction: '向前直行50米',
            distance: '50米'
        });
        steps.push({
            icon: '🔄',
            instruction: '在第一个路口右转',
            distance: '80米'
        });
    } else if (stationId === '2') { // B区充电站
        steps.push({
            icon: '⬆️',
            instruction: '向北直行100米',
            distance: '100米'
        });
        steps.push({
            icon: '⬅️',
            instruction: '在第二个路口左转',
            distance: '50米'
        });
    } else if (stationId === '3') { // C区充电站
        steps.push({
            icon: '➡️',
            instruction: '向东直行80米',
            distance: '80米'
        });
        steps.push({
            icon: '⬆️',
            instruction: '在T字路口向北转',
            distance: '70米'
        });
    }
    
    // 终点步骤
    steps.push({
        icon: '📍',
        instruction: `到达${station.name}`,
        distance: '20米'
    });
    
    // 清空现有步骤
    turnByTurnNav.innerHTML = '';
    
    // 添加新步骤
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = index === 0 ? 'nav-step active' : 'nav-step';
        
        stepElement.innerHTML = `
            <div class="nav-step-icon">${step.icon}</div>
            <div class="nav-step-instruction">${step.instruction}</div>
            <div class="nav-step-distance">${step.distance}</div>
        `;
        
        turnByTurnNav.appendChild(stepElement);
    });
}

// 开始导航
function startNavigation() {
    showMessage(requestMessage, '导航已开始，请按照指示前进', true, 'success');
    
    // 模拟导航过程
    let currentStepIndex = 0;
    const navSteps = document.querySelectorAll('.nav-step');
    
    if (navSteps.length === 0) return;
    
    const navigationInterval = setInterval(() => {
        // 移除当前步骤的活动状态
        if (currentStepIndex > 0) {
            navSteps[currentStepIndex - 1].classList.remove('active');
        }
        
        // 如果已经完成所有步骤，停止导航
        if (currentStepIndex >= navSteps.length) {
            clearInterval(navigationInterval);
            showMessage(requestMessage, '🎉 您已到达目的地！', true, 'success');
            return;
        }
        
        // 设置当前步骤为活动状态
        navSteps[currentStepIndex].classList.add('active');
        
        // 获取当前步骤的指示
        const currentInstruction = navSteps[currentStepIndex].querySelector('.nav-step-instruction').textContent;
        
        // 显示导航提示
        if (currentStepIndex > 0) { // 跳过起点
            showMessage(requestMessage, currentInstruction, true, 'info');
        }
        
        currentStepIndex++;
    }, 3000); // 每3秒更新一步
}

// 模拟导航
function simulateNavigation() {
    showMessage(requestMessage, '开始模拟导航，您可以在地图上查看路径', true, 'info');
    
    // 获取地图上的路径
    const mapRoute = document.getElementById('map-route');
    const routePath = document.getElementById('route-path');
    
    if (mapRoute && routePath) {
        // 创建一个移动点来模拟导航
        const movingDot = document.createElement('div');
        movingDot.className = 'navigation-dot';
        movingDot.style.cssText = `
            position: absolute;
            width: 12px;
            height: 12px;
            background-color: #2196F3;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            z-index: 50;
            transform: translate(-50%, -50%);
        `;
        
        document.getElementById('charging-map').appendChild(movingDot);
        
        // 获取路径长度和点
        const pathLength = routePath.getTotalLength();
        let progress = 0;
        
        // 动画移动点
        const animationInterval = setInterval(() => {
            progress += 2; // 每次增加2%
            
            if (progress > 100) {
                clearInterval(animationInterval);
                // 移除移动点
                if (movingDot.parentNode) {
                    movingDot.parentNode.removeChild(movingDot);
                }
                showMessage(requestMessage, '模拟导航完成', true, 'success');
                return;
            }
            
            // 获取路径上当前位置
            const point = routePath.getPointAtLength(pathLength * progress / 100);
            movingDot.style.left = `${point.x}px`;
            movingDot.style.top = `${point.y}px`;
        }, 50);
    }
}

// 初始化导航面板
function initNavigationPanel() {
    // 关闭导航面板按钮
    const closeNavBtn = document.getElementById('close-nav-btn');
    if (closeNavBtn) {
        closeNavBtn.addEventListener('click', () => {
            const navigationPanel = document.getElementById('navigation-panel');
            if (navigationPanel) {
                navigationPanel.classList.remove('active');
            }
            
            // 隐藏地图上的路径
            const mapRoute = document.getElementById('map-route');
            if (mapRoute) {
                mapRoute.style.display = 'none';
            }
        });
    }
    
    // 开始导航按钮
    const startNavBtn = document.getElementById('start-nav-btn');
    if (startNavBtn) {
        startNavBtn.addEventListener('click', startNavigation);
    }
    
    // 模拟导航按钮
    const simulateNavBtn = document.getElementById('simulate-nav-btn');
    if (simulateNavBtn) {
        simulateNavBtn.addEventListener('click', simulateNavigation);
    }
    
    // 路线选项切换
    const routeOptions = document.querySelectorAll('.route-option');
    routeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有选项的活动状态
            routeOptions.forEach(opt => opt.classList.remove('active'));
            // 设置当前选项为活动状态
            option.classList.add('active');
            
            // 更新导航步骤
            const stationId = document.querySelector('.map-marker.active').getAttribute('data-id');
            if (stationId) {
                updateNavigationSteps(stationId);
            }
        });
    });
}

// 召唤机器人
function summonRobot(robotId) {
    // 显示召唤消息
    showMessage(requestMessage, '正在召唤移动充电机器人，请稍候...', true, 'info');
    
    // 模拟召唤过程
    setTimeout(() => {
        showMessage(requestMessage, '✅ 充电机器人已接受召唤，正在前往您的位置', true, 'success');
        
        // 更新机器人状态
        const robotMarker = document.querySelector(`.map-marker[data-id="${robotId}"]`);
        if (robotMarker) {
            robotMarker.classList.add('busy');
            const statusBadge = robotMarker.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = '前往中';
                statusBadge.classList.remove('available');
                statusBadge.classList.add('busy');
            }
        }
        
        // 更新信息栏
        updateMapInfoBar();
    }, 2000);
}

// 更新充电站标记
function updateStationMarkers(stations) {
    const markers = document.querySelectorAll('.map-marker[data-type="station"]');
    markers.forEach(marker => {
        const stationId = parseInt(marker.getAttribute('data-id'));
        const station = stations.find(s => s.id === stationId);
        
        if (station) {
            marker.style.display = 'flex';
        } else {
            marker.style.display = 'none';
        }
    });
}

// 更新所有地图标记（优化版本）
function updateMapMarkers(stations) {
    // 如果性能优化器可用，使用它来优化渲染
    if (typeof mapOptimizer !== 'undefined' && mapOptimizer) {
        // 使用requestAnimationFrame进行优化渲染
        requestAnimationFrame(() => {
            const markers = document.querySelectorAll('.map-marker');
            const visibleMarkers = [];
            
            markers.forEach(marker => {
                const markerType = marker.getAttribute('data-type');
                let shouldShow = false;
                
                if (markerType === 'station') {
                    const stationId = parseInt(marker.getAttribute('data-id'));
                    const station = stations.find(s => s.id === stationId);
                    shouldShow = !!station;
                } else {
                    // 非充电站标记（如机器人）默认显示
                    shouldShow = true;
                }
                
                if (shouldShow) {
                    marker.style.display = 'flex';
                    visibleMarkers.push(marker);
                } else {
                    marker.style.display = 'none';
                }
            });
            
            // 更新性能指标
            if (mapOptimizer.metrics) {
                mapOptimizer.metrics.visibleMarkers = visibleMarkers.length;
                mapOptimizer.metrics.lastUpdate = Date.now();
            }
        });
    } else {
        // 回退到标准渲染
        const markers = document.querySelectorAll('.map-marker');
        markers.forEach(marker => {
            const markerType = marker.getAttribute('data-type');
            let shouldShow = false;
            
            if (markerType === 'station') {
                const stationId = parseInt(marker.getAttribute('data-id'));
                const station = stations.find(s => s.id === stationId);
                shouldShow = !!station;
            } else {
                shouldShow = true;
            }
            
            marker.style.display = shouldShow ? 'flex' : 'none';
        });
    }
}

// 预约功能
async function initReservationPage() {
    const makeReservationBtn = document.getElementById('make-reservation-btn');
    const stationSelect = document.getElementById('station-select');
    const reservationTime = document.getElementById('reservation-time');
    const estimatedDuration = document.getElementById('estimated-duration');
    const reservationsList = document.getElementById('reservations-list');
    
    // 获取充电站列表并更新下拉菜单
    try {
        const stations = await ApiService.getChargingStations();
        
        // 清空现有选项
        stationSelect.innerHTML = '<option value="">请选择充电站</option>';
        
        // 添加充电站选项
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = `${station.name} - 等待: ${station.total - station.available}人`;
            stationSelect.appendChild(option);
        });
        
        // 加载用户预约
        await loadUserReservations();
    } catch (error) {
        showMessage(requestMessage, '加载充电站信息失败', false);
    }
    
    // 设置默认预约时间为当前时间后1小时
    const now = new Date();
    now.setHours(now.getHours() + 1);
    if (reservationTime) {
        reservationTime.value = now.toISOString().slice(0, 16);
    }
    
    // 提交预约
    if (makeReservationBtn) {
        makeReservationBtn.addEventListener('click', async () => {
            const stationId = stationSelect ? stationSelect.value : '';
            const time = reservationTime ? reservationTime.value : '';
            const duration = estimatedDuration ? estimatedDuration.value : '';
            
            if (!stationId || !time) {
                showMessage(requestMessage, '请填写完整的预约信息', false);
                return;
            }
            
            try {
                // 禁用按钮，防止重复点击
                makeReservationBtn.disabled = true;
                makeReservationBtn.textContent = '预约中...';
                
                // 调用API创建预约
                const reservation = await ApiService.createReservation(stationId, time, duration);
                
                // 获取充电站名称
                const stationName = stationSelect && stationSelect.options[stationSelect.selectedIndex] ? 
                    stationSelect.options[stationSelect.selectedIndex].text.split(' - ')[0] : '未知充电站';
            
                // 创建预约项
                const reservationItem = document.createElement('div');
                reservationItem.className = 'reservation-item';
                reservationItem.innerHTML = `
                    <div class="reservation-info">
                        <div class="station-name">${stationName}</div>
                        <div class="reservation-time">${formatDateTime(time)}</div>
                        <div class="reservation-status">已确认</div>
                    </div>
                    <button class="cancel-btn" data-reservation-id="${reservation.reservationId}">取消</button>
                `;
                
                // 添加取消预约事件
                const cancelBtn = reservationItem.querySelector('.cancel-btn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', async () => {
                        if (confirm('确定要取消此预约吗？')) {
                            try {
                                await ApiService.cancelReservation(reservation.reservationId);
                                reservationItem.remove();
                                showMessage(requestMessage, '预约已取消', true);
                            } catch (error) {
                                showMessage(requestMessage, '取消预约失败', false);
                            }
                        }
                    });
                }
                
                // 添加到预约列表
                if (reservationsList) {
                    reservationsList.appendChild(reservationItem);
                }
                
                // 重置表单
                if (stationSelect) stationSelect.value = '';
                if (reservationTime) {
                    const newTime = new Date();
                    newTime.setHours(newTime.getHours() + 1);
                    reservationTime.value = newTime.toISOString().slice(0, 16);
                }
                
                showMessage(requestMessage, '预约成功！', true);
            } catch (error) {
                showMessage(requestMessage, '预约失败，请重试', false);
            } finally {
                if (makeReservationBtn) {
                    makeReservationBtn.disabled = false;
                    makeReservationBtn.textContent = '提交预约';
                }
            }
        });
    }
}

// 加载用户预约
async function loadUserReservations() {
    try {
        const reservations = await ApiService.getUserReservations();
        const reservationsList = document.getElementById('reservations-list');
        
        // 清空现有预约列表
        if (reservationsList) {
            reservationsList.innerHTML = '';
            
            // 添加预约项
            reservations.forEach(reservation => {
                const reservationItem = document.createElement('div');
                reservationItem.className = 'reservation-item';
                reservationItem.innerHTML = `
                    <div class="reservation-info">
                        <div class="station-name">${reservation.stationName}</div>
                        <div class="reservation-time">${formatDateTime(reservation.reservationTime)}</div>
                        <div class="reservation-status">已确认</div>
                    </div>
                    <button class="cancel-btn" data-reservation-id="${reservation.reservationId}">取消</button>
                `;
                
                // 添加取消预约事件
                const cancelBtn = reservationItem.querySelector('.cancel-btn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', async () => {
                        if (confirm('确定要取消此预约吗？')) {
                            try {
                                await ApiService.cancelReservation(reservation.reservationId);
                                reservationItem.remove();
                                showMessage(requestMessage, '预约已取消', true);
                            } catch (error) {
                                showMessage(requestMessage, '取消预约失败', false);
                            }
                        }
                    });
                }
                
                reservationsList.appendChild(reservationItem);
            });
        }
    } catch (error) {
        showMessage(requestMessage, '加载预约信息失败', false);
    }
}

// 支付功能
async function initPaymentPage() {
    const payBtn = document.getElementById('pay-btn');
    const invoiceBtn = document.getElementById('invoice-btn');
    const autopayCheckbox = document.getElementById('enable-autopay');
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    
    // 恢复无感支付设置
    const autopayEnabled = localStorage.getItem('autopayEnabled') === 'true';
    autopayCheckbox.checked = autopayEnabled;
    
    // 获取充电费用
    try {
        if (currentTask) {
            const cost = await ApiService.getChargingCost(currentTask.taskId);
            updateCostDisplay(cost);
        }
    } catch (error) {
        console.error('获取费用信息失败:', error);
        // 使用默认值
        updateCostDisplay({
            duration: 85,
            power: "15.2",
            serviceFee: "5.00",
            total: "23.50"
        });
    }
    
    // 加载支付历史
    try {
        await loadPaymentHistory();
    } catch (error) {
        console.error('加载支付历史失败:', error);
    }
    
    // 无感支付选项变化事件
    if (autopayCheckbox) {
        autopayCheckbox.addEventListener('change', () => {
            localStorage.setItem('autopayEnabled', autopayCheckbox.checked);
            if (autopayCheckbox.checked) {
                const paymentPage = document.getElementById('payment-page');
                if (paymentPage) {
                    showMessage(paymentPage, '已启用无感支付，下次充电将自动扣款', true);
                }
            }
        });
    }
    
    // 支付按钮事件
    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            const selectedMethodElement = document.querySelector('input[name="payment-method"]:checked');
            const selectedMethod = selectedMethodElement ? selectedMethodElement.value : '';
            const totalCostElement = document.getElementById('total-cost');
            const totalCost = totalCostElement ? totalCostElement.textContent.replace('¥', '') : '';
            
            if (!currentTask) {
                showMessage(requestMessage, '没有可支付的任务', false);
                return;
            }
            
            // 禁用按钮，防止重复点击
            payBtn.disabled = true;
            payBtn.textContent = '支付中...';
            
            try {
                // 调用API处理支付
                const payment = await ApiService.processPayment(currentTask.taskId, selectedMethod, totalCost);
                
                // 添加支付记录
                addPaymentRecord(totalCost, selectedMethod);
                
                showMessage(requestMessage, '支付成功！', true);
                
            } catch (error) {
                showMessage(requestMessage, '支付失败，请重试', false);
            } finally {
                // 重置按钮
                payBtn.disabled = false;
                payBtn.textContent = '确认支付';
            }
        });
    }
    
    // 发票申请按钮事件
    if (invoiceBtn) {
        invoiceBtn.addEventListener('click', () => {
            showInvoiceModal();
        });
    }
}

// 更新费用显示
function updateCostDisplay(cost) {
    const chargingDuration = document.getElementById('charging-duration');
    const chargingPower = document.getElementById('charging-power');
    const serviceFee = document.getElementById('service-fee');
    const totalCost = document.getElementById('total-cost');
    
    // 格式化时长
    const duration = cost.duration;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    chargingDuration.textContent = `${hours}小时${minutes}分钟`;
    
    // 更新其他费用信息
    chargingPower.textContent = `${cost.power} kWh`;
    serviceFee.textContent = `¥${cost.serviceFee}`;
    totalCost.textContent = `¥${cost.total}`;
}

// 加载支付历史
async function loadPaymentHistory() {
    try {
        const payments = await ApiService.getPaymentHistory();
        const paymentList = document.getElementById('payment-list');
        
        // 清空现有支付记录
        paymentList.innerHTML = '';
        
        // 添加支付记录
        payments.forEach(payment => {
            const paymentItem = document.createElement('div');
            paymentItem.className = 'payment-item';
            paymentItem.innerHTML = `
                <div class="payment-info">
                    <div class="payment-date">${formatDateTime(payment.timestamp)}</div>
                    <div class="payment-station">${payment.stationName}</div>
                </div>
                <div class="payment-amount">¥${payment.amount}</div>
            `;
            
            paymentList.appendChild(paymentItem);
        });
    } catch (error) {
        console.error('加载支付历史失败:', error);
    }
}

// 添加支付记录
function addPaymentRecord(amount, method) {
    const paymentList = document.getElementById('payment-list');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const paymentItem = document.createElement('div');
    paymentItem.className = 'payment-item';
    paymentItem.innerHTML = `
        <div class="payment-info">
            <div class="payment-date">${dateStr}</div>
            <div class="payment-station">${currentTask ? currentTask.location : '未知位置'}</div>
        </div>
        <div class="payment-amount">¥${amount}</div>
    `;
    
    // 插入到支付记录列表的开头
    paymentList.insertBefore(paymentItem, paymentList.firstChild);
    
    // 限制支付记录数量
    const paymentItems = paymentList.querySelectorAll('.payment-item');
    if (paymentItems.length > 5) {
        paymentList.removeChild(paymentItems[paymentItems.length - 1]);
    }
}

// 格式化日期时间
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 推荐页面功能
async function initRecommendationPage() {
    const savePreferencesBtn = document.getElementById('save-preferences-btn');
    const prefFastCharging = document.getElementById('pref-fast-charging');
    const prefHighAvailability = document.getElementById('pref-high-availability');
    const prefMaxDistance = document.getElementById('pref-max-distance');
    
    // 加载用户偏好
    try {
        const preferences = await ApiService.getUserPreferences();
        prefFastCharging.checked = preferences.fastCharging;
        prefHighAvailability.checked = preferences.highAvailability;
        prefMaxDistance.value = preferences.maxDistance;
    } catch (error) {
        console.error('加载用户偏好失败:', error);
        // 使用默认值
        prefFastCharging.checked = true;
        prefHighAvailability.checked = true;
        prefMaxDistance.value = 2000;
    }
    
    // 保存用户偏好
    savePreferencesBtn.addEventListener('click', async () => {
        const preferences = {
            fastCharging: prefFastCharging.checked,
            highAvailability: prefHighAvailability.checked,
            maxDistance: parseInt(prefMaxDistance.value)
        };
        
        try {
            savePreferencesBtn.disabled = true;
            savePreferencesBtn.textContent = '保存中...';
            
            await ApiService.updateUserPreferences(preferences);
            
            // 显示成功消息
            showMessage(requestMessage, '偏好设置已保存', true);
            
            // 重新加载推荐
            await loadRecommendedStations(preferences);
        } catch (error) {
            console.error('保存偏好设置失败:', error);
            showMessage(requestMessage, '保存偏好设置失败，请重试', false);
        } finally {
            savePreferencesBtn.disabled = false;
            savePreferencesBtn.textContent = '保存偏好';
        }
    });
    
    // 加载推荐充电站和热门充电站
    try {
        const preferences = await ApiService.getUserPreferences();
        await loadRecommendedStations(preferences);
        await loadPopularStations();
    } catch (error) {
        console.error('加载推荐数据失败:', error);
        // 使用默认偏好重试
        const defaultPreferences = {
            fastCharging: true,
            highAvailability: true,
            maxDistance: 2000
        };
        await loadRecommendedStations(defaultPreferences);
        await loadPopularStations();
    }
}

// 加载推荐充电站
async function loadRecommendedStations(preferences) {
    const recommendedStationsContainer = document.getElementById('recommended-stations');
    
    // 显示加载指示器
    recommendedStationsContainer.innerHTML = '<div class="loading"></div>';
    
    try {
        const recommendedStations = await ApiService.getRecommendedStations(null, preferences);
        
        // 清空现有内容
        recommendedStationsContainer.innerHTML = '';
        
        if (recommendedStations.length === 0) {
            recommendedStationsContainer.innerHTML = '<div class="no-results">暂无符合条件的推荐充电站</div>';
            return;
        }
        
        // 添加推荐充电站卡片
        for (const station of recommendedStations) {
            const rating = await ApiService.getStationRating(station.id);
            
            const stationCard = document.createElement('div');
            stationCard.className = 'station-card';
            stationCard.innerHTML = `
                <div class="station-card-header">
                    <div class="station-name">${station.name}</div>
                    <div class="station-score">${station.recommendationScore}分</div>
                </div>
                <div class="station-info">
                    <span>可用: ${station.available}/${station.total}</span>
                    <span class="station-distance">${station.distance}米</span>
                </div>
                <div class="station-info">
                    <span>${station.fast ? '快速充电' : '普通充电'}</span>
                    <div class="station-rating">
                        <span class="star">⭐</span>
                        <span>${rating.averageRating} (${rating.totalReviews})</span>
                    </div>
                </div>
                <div class="station-info">
                    <span>${station.address}</span>
                </div>
            `;
            
            // 添加点击事件
            stationCard.addEventListener('click', () => {
                // 更新充电页面的位置选择
                const locationSelect = document.getElementById('location');
                // 检查是否已存在该选项
                let optionExists = false;
                for (let i = 0; i < locationSelect.options.length; i++) {
                    if (locationSelect.options[i].value === station.name) {
                        optionExists = true;
                        locationSelect.selectedIndex = i;
                        break;
                    }
                }
                
                // 如果不存在，则添加新选项
                if (!optionExists) {
                    const option = document.createElement('option');
                    option.value = station.name;
                    option.textContent = station.name;
                    option.selected = true;
                    locationSelect.appendChild(option);
                }
                
                // 切换到充电页面
                const requestPageBtn = document.querySelector('[data-page="request-page"]');
                if (requestPageBtn) requestPageBtn.click();
                if (requestMessage) showMessage(requestMessage, `已选择${station.name}`, true);
            });
            
            recommendedStationsContainer.appendChild(stationCard);
        }
    } catch (error) {
        console.error('加载推荐充电站失败:', error);
        recommendedStationsContainer.innerHTML = '<div class="error">加载推荐失败，请稍后重试</div>';
    }
}

// 加载热门充电站
async function loadPopularStations() {
    const popularStationsContainer = document.getElementById('popular-stations');
    
    // 显示加载指示器
    popularStationsContainer.innerHTML = '<div class="loading"></div>';
    
    try {
        const popularStations = await ApiService.getPopularStations();
        
        // 清空现有内容
        popularStationsContainer.innerHTML = '';
        
        // 添加热门充电站卡片
        for (const station of popularStations) {
            const stationCard = document.createElement('div');
            stationCard.className = 'station-card';
            stationCard.innerHTML = `
                <div class="station-card-header">
                    <div class="station-name">${station.name}</div>
                    <div class="station-score">热度 ${station.usageCount}</div>
                </div>
                <div class="station-info">
                    <span>可用: ${station.available}/${station.total}</span>
                    <div class="station-rating">
                        <span class="star">⭐</span>
                        <span>${station.averageRating} (${station.totalReviews})</span>
                    </div>
                </div>
                <div class="station-info">
                    <span>${station.fast ? '快速充电' : '普通充电'}</span>
                </div>
                <div class="station-info">
                    <span>${station.address}</span>
                </div>
            `;
            
            // 添加点击事件
            stationCard.addEventListener('click', () => {
                // 更新充电页面的位置选择
                const locationSelect = document.getElementById('location');
                // 检查是否已存在该选项
                let optionExists = false;
                for (let i = 0; i < locationSelect.options.length; i++) {
                    if (locationSelect.options[i].value === station.name) {
                        optionExists = true;
                        locationSelect.selectedIndex = i;
                        break;
                    }
                }
                
                // 如果不存在，则添加新选项
                if (!optionExists) {
                    const option = document.createElement('option');
                    option.value = station.name;
                    option.textContent = station.name;
                    option.selected = true;
                    locationSelect.appendChild(option);
                }
                
                // 切换到充电页面
                const requestPageBtn = document.querySelector('[data-page="request-page"]');
                if (requestPageBtn) requestPageBtn.click();
                if (requestMessage) showMessage(requestMessage, `已选择${station.name}`, true);
            });
            
            popularStationsContainer.appendChild(stationCard);
        }
    } catch (error) {
        console.error('加载热门充电站失败:', error);
        popularStationsContainer.innerHTML = '<div class="error">加载热门充电站失败，请稍后重试</div>';
    }
}

// 社区页面功能
async function initCommunityPage() {
    const reviewStationSelect = document.getElementById('review-station-select');
    const starRating = document.getElementById('star-rating');
    const reviewComment = document.getElementById('review-comment');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    
    let selectedRating = 0;
    let selectedStationId = null;
    
    // 加载充电站列表
    try {
        const stations = await ApiService.getChargingStations();
        
        // 清空现有选项
        reviewStationSelect.innerHTML = '<option value="">请选择充电站</option>';
        
        // 添加充电站选项
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = station.name;
            reviewStationSelect.appendChild(option);
        });
    } catch (error) {
        console.error('加载充电站列表失败:', error);
    }
    
    // 充电站选择变化事件
    reviewStationSelect.addEventListener('change', async () => {
        selectedStationId = reviewStationSelect.value;
        if (selectedStationId) {
            await loadStationReviews(selectedStationId);
        } else {
            document.getElementById('reviews-list').innerHTML = '';
        }
    });
    
    // 星级评分点击事件
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStarDisplay(selectedRating);
        });
    });
    
    // 提交评价
    submitReviewBtn.addEventListener('click', async () => {
        if (!selectedStationId) {
            showMessage(requestMessage, '请选择充电站', false);
            return;
        }
        
        if (selectedRating === 0) {
            showMessage(requestMessage, '请选择评分', false);
            return;
        }
        
        const comment = reviewComment.value.trim();
        if (!comment) {
            showMessage(requestMessage, '请输入评价内容', false);
            return;
        }
        
        try {
            // 禁用按钮，防止重复点击
            submitReviewBtn.disabled = true;
            submitReviewBtn.textContent = '提交中...';
            
            // 调用API提交评价
            await ApiService.submitReview(selectedStationId, selectedRating, comment);
            
            // 重置表单
            selectedRating = 0;
            updateStarDisplay(0);
            reviewComment.value = '';
            
            // 重新加载评价列表
            await loadStationReviews(selectedStationId);
            
            showMessage(requestMessage, '评价提交成功！', true);
        } catch (error) {
            showMessage(requestMessage, '提交评价失败，请重试', false);
        } finally {
            submitReviewBtn.disabled = false;
            submitReviewBtn.textContent = '提交评价';
        }
    });
}

// 加载充电站评价
async function loadStationReviews(stationId) {
    const reviewsList = document.getElementById('reviews-list');
    
    // 显示加载指示器
    reviewsList.innerHTML = '<div class="loading"></div>';
    
    try {
        const reviews = await ApiService.getStationReviews(stationId);
        
        // 清空现有评价
        reviewsList.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<div class="no-reviews">暂无评价，成为第一个评价者吧！</div>';
            return;
        }
        
        // 添加评价卡片
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <div class="review-user">${review.userName}</div>
                    <div class="review-date">${formatDateTime(review.timestamp)}</div>
                </div>
                <div class="review-rating">
                    ${generateStarHtml(review.rating)}
                </div>
                <div class="review-comment">${review.comment}</div>
                <div class="review-actions">
                    <button class="helpful-btn" data-review-id="${review.reviewId}">
                        <span>👍</span>
                        <span>有用 (${review.helpful})</span>
                    </button>
                </div>
            `;
            
            // 添加点赞按钮事件
            const helpfulBtn = reviewCard.querySelector('.helpful-btn');
            helpfulBtn.addEventListener('click', async () => {
                try {
                    helpfulBtn.disabled = true;
                    helpfulBtn.innerHTML = '<span>👍</span><span>处理中...</span>';
                    
                    const result = await ApiService.helpfulReview(review.reviewId);
                    helpfulBtn.innerHTML = `
                        <span>👍</span>
                        <span>有用 (${result.newHelpfulCount})</span>
                    `;
                } catch (error) {
                    console.error('点赞失败:', error);
                    helpfulBtn.disabled = false;
                    helpfulBtn.innerHTML = `
                        <span>👍</span>
                        <span>有用 (${review.helpful})</span>
                    `;
                }
            });
            
            reviewsList.appendChild(reviewCard);
        });
    } catch (error) {
        console.error('加载评价失败:', error);
        reviewsList.innerHTML = '<div class="error">加载评价失败，请稍后重试</div>';
    }
}

// 更新星级显示
function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('#star-rating .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// 生成星级HTML
function generateStarHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<span class="star">⭐</span>';
        } else {
            html += '<span class="star" style="color: #ddd;">⭐</span>';
        }
    }
    return html;
}

// ========== 性能优化与安全增强模块 ==========

// 性能监控模块
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            apiResponseTimes: [],
            pageLoadTimes: [],
            errorCounts: {},
            lastCleanup: Date.now()
        };
        
        // 定期清理旧数据
        setInterval(() => this.cleanupMetrics(), 24 * 60 * 60 * 1000); // 每天清理一次
    }
    
    // 记录API响应时间
    recordApiCall(endpoint, startTime) {
        const responseTime = Date.now() - startTime;
        this.metrics.apiResponseTimes.push({
            endpoint,
            responseTime,
            timestamp: Date.now()
        });
        
        // 如果响应时间过长，记录警告
        if (responseTime > 3000) {
            console.warn(`API响应时间过长: ${endpoint} - ${responseTime}ms`);
        }
    }
    
    // 记录页面加载时间
    recordPageLoad(pageName, loadTime) {
        this.metrics.pageLoadTimes.push({
            pageName,
            loadTime,
            timestamp: Date.now()
        });
    }
    
    // 记录错误
    recordError(errorType, errorDetails) {
        if (!this.metrics.errorCounts[errorType]) {
            this.metrics.errorCounts[errorType] = 0;
        }
        this.metrics.errorCounts[errorType]++;
        
        // 记录错误详情用于调试
        console.error(`错误记录: ${errorType}`, errorDetails);
    }
    
    // 获取性能报告
    getPerformanceReport() {
        const now = Date.now();
        const last24h = now - 24 * 60 * 60 * 1000;
        
        // 过滤最近24小时的数据
        const recentApiCalls = this.metrics.apiResponseTimes.filter(call => call.timestamp > last24h);
        const recentPageLoads = this.metrics.pageLoadTimes.filter(load => load.timestamp > last24h);
        
        // 计算平均值
        const avgApiResponseTime = recentApiCalls.length > 0 
            ? recentApiCalls.reduce((sum, call) => sum + call.responseTime, 0) / recentApiCalls.length 
            : 0;
            
        const avgPageLoadTime = recentPageLoads.length > 0 
            ? recentPageLoads.reduce((sum, load) => sum + load.loadTime, 0) / recentPageLoads.length 
            : 0;
        
        return {
            avgApiResponseTime: Math.round(avgApiResponseTime),
            avgPageLoadTime: Math.round(avgPageLoadTime),
            totalApiCalls: recentApiCalls.length,
            totalPageLoads: recentPageLoads.length,
            errorCounts: this.metrics.errorCounts
        };
    }
    
    // 清理旧数据
    cleanupMetrics() {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        
        this.metrics.apiResponseTimes = this.metrics.apiResponseTimes.filter(
            call => call.timestamp > weekAgo
        );
        
        this.metrics.pageLoadTimes = this.metrics.pageLoadTimes.filter(
            load => load.timestamp > weekAgo
        );
        
        this.metrics.lastCleanup = now;
        console.log('性能监控数据已清理');
    }
}

// 缓存管理模块
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        
        // 定期清理过期缓存
        setInterval(() => this.cleanupExpiredCache(), 60 * 1000); // 每分钟清理一次
    }
    
    // 设置缓存
    set(key, value, ttlMs = 5 * 60 * 1000) { // 默认5分钟过期
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + ttlMs);
    }
    
    // 获取缓存
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        
        // 检查是否过期
        if (Date.now() > this.cacheExpiry.get(key)) {
            this.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }
    
    // 删除缓存
    delete(key) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
    }
    
    // 清理过期缓存
    cleanupExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, expiry] of this.cacheExpiry.entries()) {
            if (now > expiry) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => this.delete(key));
        
        if (expiredKeys.length > 0) {
            console.log(`清理了 ${expiredKeys.length} 个过期缓存项`);
        }
    }
    
    // 清空所有缓存
    clear() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }
    
    // 获取缓存统计
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 安全模块
class SecurityService {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30分钟会话超时
        this.lastActivity = Date.now();
        this.setupActivityTracking();
    }
    
    // 设置活动跟踪
    setupActivityTracking() {
        // 监听用户活动
        ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            }, { passive: true });
        });
        
        // 定期检查会话状态
        setInterval(() => {
            if (Date.now() - this.lastActivity > this.sessionTimeout) {
                this.handleSessionTimeout();
            }
        }, 60 * 1000); // 每分钟检查一次
    }
    
    // 处理会话超时
    handleSessionTimeout() {
        console.warn('用户会话超时，需要重新登录');
        // 在实际应用中，这里应该跳转到登录页面
        this.showSessionTimeoutModal();
    }
    
    // 显示会话超时模态框
    showSessionTimeoutModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal security-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>会话已超时</h3>
                    </div>
                    <div class="modal-body">
                        <p>由于长时间无操作，您的会话已超时。为了安全起见，请重新验证身份。</p>
                    </div>
                    <div class="modal-footer">
                        <button id="reauth-btn" class="primary-btn">重新验证</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定重新验证按钮事件
        document.getElementById('reauth-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.performReauthentication();
        });
    }
    
    // 执行重新认证
    performReauthentication() {
        // 在实际应用中，这里应该跳转到登录页面或显示验证表单
        console.log('执行重新认证');
        // 模拟重新认证过程
        showMessage(document.querySelector('.page.active'), '验证成功，会话已恢复', true);
        this.lastActivity = Date.now();
    }
    
    // 数据脱敏处理
    maskSensitiveData(data, dataType) {
        if (!data) return data;
        
        switch (dataType) {
            case 'phone':
                // 手机号脱敏: 138****1234
                return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                
            case 'licensePlate':
                // 车牌号脱敏: 京A****5
                return data.replace(/([\u4e00-\u9fa5][A-Z])\d{4}(\d)/, '$1****$2');
                
            case 'idCard':
                // 身份证脱敏: 110101********1234
                return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
                
            case 'email':
                // 邮箱脱敏: u***@example.com
                const [username, domain] = data.split('@');
                const maskedUsername = username.charAt(0) + '***';
                return `${maskedUsername}@${domain}`;
                
            default:
                return data;
        }
    }
    
    // 生成安全的随机令牌
    generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        
        // 使用加密安全的随机数生成器
        const randomArray = new Uint8Array(length);
        crypto.getRandomValues(randomArray);
        
        for (let i = 0; i < length; i++) {
            token += chars[randomArray[i] % chars.length];
        }
        
        return token;
    }
    
    // 验证输入安全性
    validateInput(input, type) {
        if (!input || typeof input !== 'string') {
            return { valid: false, error: '输入不能为空' };
        }
        
        // 基本XSS防护
        if (/<script|javascript:|on\w+=/i.test(input)) {
            return { valid: false, error: '输入包含不安全内容' };
        }
        
        switch (type) {
            case 'phone':
                if (!/^1[3-9]\d{9}$/.test(input)) {
                    return { valid: false, error: '请输入有效的手机号码' };
                }
                break;
                
            case 'licensePlate':
                if (!/^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$/.test(input)) {
                    return { valid: false, error: '请输入有效的车牌号码' };
                }
                break;
                
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
                    return { valid: false, error: '请输入有效的邮箱地址' };
                }
                break;
        }
        
        return { valid: true };
    }
}

// 实时数据更新管理器
class RealtimeDataManager {
    constructor() {
        this.updateIntervals = new Map();
        this.updateCallbacks = new Map();
        this.defaultUpdateInterval = 10000; // 默认10秒更新一次
    }
    
    // 注册实时更新
    registerUpdate(key, callback, intervalMs = this.defaultUpdateInterval) {
        // 如果已经存在，先清除旧的定时器
        if (this.updateIntervals.has(key)) {
            clearInterval(this.updateIntervals.get(key));
        }
        
        // 保存回调函数
        this.updateCallbacks.set(key, callback);
        
        // 设置新的定时器
        const intervalId = setInterval(() => {
            try {
                callback();
            } catch (error) {
                console.error(`实时更新失败 (${key}):`, error);
                performanceMonitor.recordError('realtime_update', { key, error: error.message });
            }
        }, intervalMs);
        
        this.updateIntervals.set(key, intervalId);
        
        // 立即执行一次
        callback();
    }
    
    // 取消实时更新
    unregisterUpdate(key) {
        if (this.updateIntervals.has(key)) {
            clearInterval(this.updateIntervals.get(key));
            this.updateIntervals.delete(key);
            this.updateCallbacks.delete(key);
        }
    }
    
    // 暂停所有实时更新（页面不可见时）
    pauseAllUpdates() {
        this.updateIntervals.forEach((intervalId, key) => {
            clearInterval(intervalId);
        });
        this.updateIntervals.clear();
    }
    
    // 恢复所有实时更新（页面可见时）
    resumeAllUpdates() {
        this.updateCallbacks.forEach((callback, key) => {
            this.registerUpdate(key, callback);
        });
    }
    
    // 设置页面可见性变化监听
    setupVisibilityChangeHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllUpdates();
            } else {
                this.resumeAllUpdates();
            }
        });
    }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();
const cacheManager = new CacheManager();
const securityService = new SecurityService();
const realtimeDataManager = new RealtimeDataManager();

// 设置页面可见性变化处理
realtimeDataManager.setupVisibilityChangeHandler();

// 增强API服务类，添加性能监控和缓存
const originalApiService = {
    requestCharge: ApiService.requestCharge.bind(ApiService),
    requestChargeWithParams: ApiService.requestChargeWithParams.bind(ApiService),
    getTaskStatus: ApiService.getTaskStatus.bind(ApiService),
    getChargingStations: ApiService.getChargingStations.bind(ApiService),
    getStationDetails: ApiService.getStationDetails.bind(ApiService),
    searchStations: ApiService.searchStations.bind(ApiService),
    createReservation: ApiService.createReservation.bind(ApiService),
    getUserReservations: ApiService.getUserReservations.bind(ApiService),
    cancelReservation: ApiService.cancelReservation.bind(ApiService),
    getChargingCost: ApiService.getChargingCost.bind(ApiService),
    processPayment: ApiService.processPayment.bind(ApiService),
    getPaymentHistory: ApiService.getPaymentHistory.bind(ApiService),
    getUserReviews: ApiService.getUserReviews.bind(ApiService),
    submitReview: ApiService.submitReview.bind(ApiService),
    getRecommendedStations: ApiService.getRecommendedStations.bind(ApiService),
    getStationReviews: ApiService.getStationReviews.bind(ApiService),
    helpfulReview: ApiService.helpfulReview.bind(ApiService),
    getStationRating: ApiService.getStationRating.bind(ApiService),
    getPopularStations: ApiService.getPopularStations.bind(ApiService),
    getUserPreferences: ApiService.getUserPreferences.bind(ApiService),
    updateUserPreferences: ApiService.updateUserPreferences.bind(ApiService),
    getUserProfile: ApiService.getUserProfile.bind(ApiService),
    updateUserProfile: ApiService.updateUserProfile.bind(ApiService),
    getUserVehicles: ApiService.getUserVehicles.bind(ApiService),
    addVehicle: ApiService.addVehicle.bind(ApiService),
    updateVehicle: ApiService.updateVehicle.bind(ApiService),
    deleteVehicle: ApiService.deleteVehicle.bind(ApiService),
    getNotifications: ApiService.getNotifications.bind(ApiService),
    markNotificationAsRead: ApiService.markNotificationAsRead.bind(ApiService),
    getUserStatistics: ApiService.getUserStatistics.bind(ApiService),
    submitFeedback: ApiService.submitFeedback.bind(ApiService),
    getReferralCode: ApiService.getReferralCode.bind(ApiService),
    applyReferralCode: ApiService.applyReferralCode.bind(ApiService),
    getReferralRewards: ApiService.getReferralRewards.bind(ApiService),
    getAchievements: ApiService.getAchievements.bind(ApiService),
    getLeaderboard: ApiService.getLeaderboard.bind(ApiService)
};

// 增强API方法
ApiService.getChargingStations = async function() {
    const cacheKey = 'charging_stations';
    const startTime = Date.now();
    
    // 尝试从缓存获取
    let stations = cacheManager.get(cacheKey);
    
    if (!stations) {
        // 缓存中没有，调用原始方法
        stations = await originalApiService.getChargingStations();
        
        // 存入缓存，5分钟有效期
        cacheManager.set(cacheKey, stations, 5 * 60 * 1000);
    }
    
    // 记录性能指标
    performanceMonitor.recordApiCall('getChargingStations', startTime);
    
    return stations;
};

ApiService.getTaskStatus = async function(taskId) {
    const startTime = Date.now();
    
    try {
        const result = await originalApiService.getTaskStatus(taskId);
        
        // 记录性能指标
        performanceMonitor.recordApiCall('getTaskStatus', startTime);
        
        return result;
    } catch (error) {
        // 记录错误
        performanceMonitor.recordError('getTaskStatus', error);
        throw error;
    }
};

// 增强任务状态更新函数，使用实时数据管理器
const originalUpdateTaskStatus = updateTaskStatus;
updateTaskStatus = function() {
    if (!currentTask) return;
    
    // 注册实时更新
    realtimeDataManager.registerUpdate(
        'taskStatus',
        async () => {
            try {
                const task = await ApiService.getTaskStatus(currentTask.taskId);
                currentTask = task;
                updateTaskDisplay(task);
                
                // 如果任务完成，显示完成消息并停止更新
                if (task.status === 'Completed') {
                    showMessage(requestMessage, '充电已完成！', true);
                    addHistoryItem(task);
                    realtimeDataManager.unregisterUpdate('taskStatus');
                }
            } catch (error) {
                console.error('获取状态失败:', error);
                performanceMonitor.recordError('updateTaskStatus', error);
            }
        },
        5000 // 每5秒更新一次
    );
};

// 页面加载性能监控
// 已整合到app.init()中
// document.addEventListener('DOMContentLoaded', () => {
//     // 记录页面加载时间
//     const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
//     performanceMonitor.recordPageLoad('app', pageLoadTime);
//     
//     // 如果加载时间过长，记录警告
//     if (pageLoadTime > 3000) {
//         console.warn(`页面加载时间过长: ${pageLoadTime}ms`);
//     }
// });

// 初始化实时数据更新
if (currentTask) {
    updateTaskStatus();
}

// 添加全局错误处理
window.addEventListener('error', (event) => {
    performanceMonitor.recordError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
    performanceMonitor.recordError('unhandled_promise_rejection', {
        reason: event.reason
    });
});

// ========== 性能监控面板交互逻辑 ==========

// 性能面板相关DOM元素
const performancePanel = document.getElementById('performance-panel');
const performanceToggle = document.getElementById('performance-toggle');
const networkStatus = document.getElementById('network-status');
const loadingOverlay = document.getElementById('loading-overlay');
const cacheStatus = document.getElementById('cache-status');

// 性能指标显示元素
const apiResponseTimeEl = document.getElementById('api-response-time');
const pageLoadTimeEl = document.getElementById('page-load-time');
const apiCallCountEl = document.getElementById('api-call-count');
const cacheHitCountEl = document.getElementById('cache-hit-count');
const errorCountEl = document.getElementById('error-count');

// 性能面板切换
if (performanceToggle) {
    performanceToggle.addEventListener('click', () => {
        performancePanel.classList.toggle('visible');
        
        // 如果是打开面板，添加打开性能监控页面的按钮
        if (performancePanel.classList.contains('visible')) {
            // 检查是否已经添加了按钮
            if (!performancePanel.querySelector('#open-performance-monitor')) {
                const openMonitorBtn = document.createElement('button');
                openMonitorBtn.id = 'open-performance-monitor';
                openMonitorBtn.className = 'btn';
                openMonitorBtn.textContent = '打开性能监控面板';
                openMonitorBtn.style.marginTop = '10px';
                openMonitorBtn.style.width = '100%';
                
                openMonitorBtn.addEventListener('click', () => {
                    // 打开性能监控页面
                window.open('performance_monitor.html', '_blank');
            });
            
            performancePanel.appendChild(openMonitorBtn);
        }
    }
    
    // 更新性能数据
    updatePerformancePanel();
    });
}

// 更新性能面板数据
function updatePerformancePanel() {
    const report = performanceMonitor.getPerformanceReport();
    const cacheStats = cacheManager.getStats();
    
    // 更新API响应时间
    apiResponseTimeEl.textContent = `${report.avgApiResponseTime}ms`;
    if (report.avgApiResponseTime > 2000) {
        apiResponseTimeEl.parentElement.classList.add('warning');
    } else {
        apiResponseTimeEl.parentElement.classList.remove('warning');
    }
    
    // 更新页面加载时间
    pageLoadTimeEl.textContent = `${report.avgPageLoadTime}ms`;
    if (report.avgPageLoadTime > 3000) {
        pageLoadTimeEl.parentElement.classList.add('warning');
    } else {
        pageLoadTimeEl.parentElement.classList.remove('warning');
    }
    
    // 更新API调用次数
    apiCallCountEl.textContent = report.totalApiCalls;
    
    // 更新缓存命中次数
    cacheHitCountEl.textContent = cacheStats.size;
    
    // 更新错误次数
    const totalErrors = Object.values(report.errorCounts).reduce((sum, count) => sum + count, 0);
    errorCountEl.textContent = totalErrors;
    if (totalErrors > 0) {
        errorCountEl.parentElement.classList.add('error');
    } else {
        errorCountEl.parentElement.classList.remove('error');
    }
}

// 增强缓存管理器，添加缓存命中计数
const originalCacheGet = cacheManager.get.bind(cacheManager);
let cacheHitCount = 0;

cacheManager.get = function(key) {
    const result = originalCacheGet(key);
    if (result !== null) {
        cacheHitCount++;
        showCacheStatus('缓存命中');
    }
    return result;
};

// 显示缓存状态
function showCacheStatus(message) {
    cacheStatus.textContent = message;
    cacheStatus.classList.add('visible');
    
    // 2秒后隐藏
    setTimeout(() => {
        cacheStatus.classList.remove('visible');
    }, 2000);
}

// 显示加载状态
function showLoading() {
    networkStatus.classList.add('loading');
    loadingOverlay.classList.add('active');
}

// 隐藏加载状态
function hideLoading() {
    networkStatus.classList.remove('loading');
    loadingOverlay.classList.remove('active');
}

// 显示网络错误
function showNetworkError() {
    networkStatus.classList.add('error');
    
    // 3秒后移除错误状态
    setTimeout(() => {
        networkStatus.classList.remove('error');
    }, 3000);
}

// 增强API服务，添加网络状态指示
const originalRequestCharge = ApiService.requestCharge;
ApiService.requestCharge = async function(location) {
    showLoading();
    const startTime = Date.now();
    
    try {
        const result = await originalRequestCharge(location);
        performanceMonitor.recordApiCall('requestCharge', startTime);
        return result;
    } catch (error) {
        showNetworkError();
        performanceMonitor.recordError('requestCharge', error);
        throw error;
    } finally {
        hideLoading();
    }
};

// 增强其他API调用
const originalGetChargingStations = ApiService.getChargingStations;
ApiService.getChargingStations = async function() {
    showLoading();
    const startTime = Date.now();
    
    try {
        const result = await originalGetChargingStations();
        performanceMonitor.recordApiCall('getChargingStations', startTime);
        return result;
    } catch (error) {
        showNetworkError();
        performanceMonitor.recordError('getChargingStations', error);
        throw error;
    } finally {
        hideLoading();
    }
};

// 增强表单验证功能
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        const validationType = input.getAttribute('data-validation');
        const formGroup = input.closest('.form-group');
        
        if (validationType) {
            const validation = securityService.validateInput(input.value, validationType);
            
            if (!validation.valid) {
                formGroup.classList.add('error');
                
                // 显示错误消息
                let errorMessage = formGroup.querySelector('.error-message');
                if (!errorMessage) {
                    errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    formGroup.appendChild(errorMessage);
                }
                errorMessage.textContent = validation.error;
                
                isValid = false;
            } else {
                formGroup.classList.remove('error');
            }
        }
    });
    
    return isValid;
}

// 增强车辆管理表单，添加安全验证
function enhanceVehicleForm() {
    const vehicleForm = document.getElementById('vehicle-form');
    if (!vehicleForm) return;
    
    // 添加验证类型属性
    const licensePlateInput = vehicleForm.querySelector('#vehicle-plate');
    if (licensePlateInput) {
        licensePlateInput.setAttribute('data-validation', 'licensePlate');
    }
    
    // 表单提交时进行验证
    vehicleForm.addEventListener('submit', (e) => {
        if (!validateForm(vehicleForm)) {
            e.preventDefault();
        }
    });
}

// 增强支付表单，添加安全验证
function enhancePaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) return;
    
    // 添加验证类型属性
    const phoneInput = paymentForm.querySelector('#payment-phone');
    if (phoneInput) {
        phoneInput.setAttribute('data-validation', 'phone');
    }
    
    // 表单提交时进行验证
    paymentForm.addEventListener('submit', (e) => {
        if (!validateForm(paymentForm)) {
            e.preventDefault();
        }
    });
}

// 页面加载完成后增强表单
// 已整合到app.init()中
// document.addEventListener('DOMContentLoaded', () => {
//     enhanceVehicleForm();
//     enhancePaymentForm();
//     
//     // 定期更新性能面板（如果可见）
//     setInterval(() => {
//         if (performancePanel.classList.contains('visible')) {
//             updatePerformancePanel();
//         }
//     }, 5000);
// });

// 初始化增长与运营功能
initOnboardingGuide();
initActivityNotifications();
initFeedbackSystem();
initReferralProgram();
initDataInsights();
initAchievementSystem();

// 新手引导功能
function initOnboardingGuide() {
    const guideOverlay = document.getElementById('guide-overlay');
    const guideSkip = document.getElementById('guide-skip');
    const guideSteps = document.querySelectorAll('.guide-step');
    
    // 检查元素是否存在
    if (!guideOverlay || !guideSkip || guideSteps.length === 0) {
        console.log('新手引导元素不存在，跳过引导功能');
        return;
    }
    
    let currentStep = 0;
    
    // 检查是否是首次访问
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
        guideOverlay.style.display = 'flex';
        currentStep = 0;
        showGuideStep(currentStep);
        
        // 3秒后自动关闭引导，减少等待时间
        setTimeout(() => {
            if (guideOverlay.style.display === 'flex') {
                closeGuide();
            }
        }, 3000);
        
        // 添加点击事件，点击任何地方都可以关闭引导
        guideOverlay.addEventListener('click', (e) => {
            if (e.target === guideOverlay) {
                closeGuide();
            }
        });
    }
    
    // 显示指定步骤
    function showGuideStep(stepIndex) {
        guideSteps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });
    }
    
    // 下一步按钮事件
    document.querySelectorAll('.guide-next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep++;
            if (currentStep < guideSteps.length) {
                showGuideStep(currentStep);
            } else {
                closeGuide();
            }
        });
    });
    
    // 跳过引导事件
    guideSkip.addEventListener('click', closeGuide);
    document.querySelectorAll('.guide-skip-btn').forEach(btn => {
        btn.addEventListener('click', closeGuide);
    });
    
    function closeGuide() {
        guideOverlay.style.display = 'none';
        localStorage.setItem('hasVisitedBefore', 'true');
    }
}

// 活动通知功能
function initActivityNotifications() {
    const activityNotification = document.getElementById('activity-notification');
    const notificationClose = document.getElementById('notification-close');
    const notificationAction = document.getElementById('notification-action');
    
    // 检查是否已关闭通知
    const notificationClosed = localStorage.getItem('notificationClosed');
    if (!notificationClosed) {
        activityNotification.style.display = 'block';
    }
    
    // 关闭通知
    notificationClose.addEventListener('click', () => {
        activityNotification.style.display = 'none';
        localStorage.setItem('notificationClosed', 'true');
    });
    
    // 查看活动详情
    notificationAction.addEventListener('click', () => {
        activityNotification.style.display = 'none';
        localStorage.setItem('notificationClosed', 'true');
        router.navigateTo('promotions-page');
    });
}

// 反馈系统功能
function initFeedbackSystem() {
    const feedbackButton = document.getElementById('feedback-button');
    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackClose = document.getElementById('feedback-modal').querySelector('.modal-close');
    const feedbackSubmit = document.getElementById('submit-feedback-btn');
    const feedbackType = document.getElementById('feedback-type');
    const feedbackContent = document.getElementById('feedback-content');
    
    // 打开反馈弹窗
    feedbackButton.addEventListener('click', () => {
        feedbackModal.classList.remove('hidden');
    });
    
    // 关闭反馈弹窗
    feedbackClose.addEventListener('click', () => {
        feedbackModal.classList.add('hidden');
    });
    
    // 提交反馈
    feedbackSubmit.addEventListener('click', () => {
        const type = feedbackType.value;
        const content = feedbackContent.value;
        
        if (!content.trim()) {
            showToast('请输入反馈内容', 'error');
            return;
        }
        
        // 模拟提交反馈
        showToast('感谢您的反馈，我们会尽快处理', 'success');
        feedbackModal.classList.add('hidden');
        feedbackContent.value = '';
        
        // 保存反馈记录
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        feedbacks.push({
            type,
            content,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    });
}

// 邀请好友功能
function initReferralProgram() {
    const referralModal = document.getElementById('invite-modal');
    const referralClose = document.getElementById('invite-modal').querySelector('.modal-close');
    const referralShare = document.getElementById('copy-link-btn');
    const referralCode = document.getElementById('invite-code-panel').querySelector('.code-text');
    const referralHistory = document.querySelector('.invite-list');
    
    // 生成邀请码
    const userReferralCode = localStorage.getItem('referralCode') || generateReferralCode();
    localStorage.setItem('referralCode', userReferralCode);
    referralCode.textContent = userReferralCode;
    
    // 关闭邀请弹窗
    referralClose.addEventListener('click', () => {
        referralModal.classList.add('hidden');
    });
    
    // 分享邀请码
    referralShare.addEventListener('click', () => {
        const shareText = `我在使用灵眸驰驭移动无线充电服务，体验非常棒！使用我的邀请码 ${userReferralCode} 注册，您可获得20元优惠券，我也能获得10元奖励。快来体验吧！`;
        
        // 检查是否支持Web Share API
        if (navigator.share) {
            navigator.share({
                title: '灵眸驰驭 - 移动无线充电',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('分享失败:', err);
                copyToClipboard(shareText);
            });
        } else {
            copyToClipboard(shareText);
        }
    });
    
    // 显示邀请记录
    updateReferralHistory();
    
    function generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('邀请链接已复制到剪贴板', 'success');
    }
    
    function updateReferralHistory() {
        const referrals = JSON.parse(localStorage.getItem('referrals') || '[]');
        referralHistory.innerHTML = '';
        
        if (referrals.length === 0) {
            referralHistory.innerHTML = '<p>暂无邀请记录</p>';
            return;
        }
        
        referrals.forEach(referral => {
            const item = document.createElement('div');
            item.className = 'referral-item';
            item.innerHTML = `
                <div class="referral-info">
                    <div class="referral-name">${referral.name}</div>
                    <div class="referral-date">${formatDate(referral.date)}</div>
                </div>
                <div class="referral-status ${referral.status}">${referral.status === 'completed' ? '已完成' : '进行中'}</div>
            `;
            referralHistory.appendChild(item);
        });
    }
}

// 数据洞察功能
function initDataInsights() {
    updateDataInsights();
    
    // 每次打开个人中心时更新数据
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            setTimeout(updateDataInsights, 100);
        });
    }
    
    function updateDataInsights() {
        // 获取用户充电记录
        const chargingHistory = JSON.parse(localStorage.getItem('chargingHistory') || '[]');
        
        // 计算统计数据
        const totalChargingSessions = chargingHistory.length;
        const totalChargingTime = chargingHistory.reduce((total, session) => {
            if (session.endTime && session.startTime) {
                return total + (new Date(session.endTime) - new Date(session.startTime));
            }
            return total;
        }, 0);
        
        const totalEnergyConsumed = chargingHistory.reduce((total, session) => {
            return total + (session.energyConsumed || 0);
        }, 0);
        
        const totalCost = chargingHistory.reduce((total, session) => {
            return total + (session.cost || 0);
        }, 0);
        
        // 计算环保贡献
        const co2Reduction = (totalEnergyConsumed * 0.5).toFixed(1); // 假设每度电减少0.5kg碳排放
        const treesEquivalent = (co2Reduction / 20).toFixed(1); // 假设一棵树每年吸收20kg碳排放
        
        // 更新页面显示
        const co2Element = document.querySelector('.insight-card:nth-child(1) strong');
        const treesElement = document.querySelector('.insight-card:nth-child(1) strong:nth-child(2)');
        
        if (co2Element) co2Element.textContent = `${co2Reduction}kg`;
        if (treesElement) treesElement.textContent = treesEquivalent;
        
        // 更新充电统计
        const sessionsElement = document.querySelector('.insight-card:nth-child(2) strong');
        const timeElement = document.querySelector('.insight-card:nth-child(2) strong:nth-child(2)');
        
        if (sessionsElement) sessionsElement.textContent = totalChargingSessions;
        if (timeElement) {
            const hours = Math.floor(totalChargingTime / (1000 * 60 * 60));
            const minutes = Math.floor((totalChargingTime % (1000 * 60 * 60)) / (1000 * 60));
            timeElement.textContent = `${hours}小时${minutes}分钟`;
        }
        
        // 更新费用统计
        const costElement = document.querySelector('.insight-card:nth-child(3) strong');
        const savingsElement = document.querySelector('.insight-card:nth-child(3) strong:nth-child(2)');
        
        if (costElement) costElement.textContent = `¥${totalCost.toFixed(2)}`;
        if (savingsElement) {
            const estimatedSavings = (totalCost * 0.1).toFixed(2); // 假设节省10%的费用
            savingsElement.textContent = `¥${estimatedSavings}`;
        }
    }
}

// 成就系统功能
function initAchievementSystem() {
    updateAchievements();
    
    function updateAchievements() {
        // 获取用户充电记录
        const chargingHistory = JSON.parse(localStorage.getItem('chargingHistory') || '[]');
        
        // 定义成就条件
        const achievements = [
            { id: 'first-charge', name: '初体验', icon: '⚡', condition: () => chargingHistory.length >= 1 },
            { id: 'regular-user', name: '常客', icon: '🔋', condition: () => chargingHistory.length >= 5 },
            { id: 'power-user', name: '达人', icon: '💪', condition: () => chargingHistory.length >= 20 },
            { id: 'eco-warrior', name: '环保卫士', icon: '🌱', condition: () => {
                const totalEnergy = chargingHistory.reduce((total, session) => total + (session.energyConsumed || 0), 0);
                return totalEnergy >= 100; // 累计充电100度电
            }},
            { id: 'night-owl', name: '夜猫子', icon: '🦉', condition: () => {
                return chargingHistory.some(session => {
                    if (!session.startTime) return false;
                    const hour = new Date(session.startTime).getHours();
                    return hour >= 22 || hour <= 6; // 晚上10点到早上6点充电
                });
            } },
            { id: 'early-bird', name: '早鸟', icon: '🐦', condition: () => {
                return chargingHistory.some(session => {
                    if (!session.startTime) return false;
                    const hour = new Date(session.startTime).getHours();
                    return hour >= 6 && hour <= 9; // 早上6点到9点充电
                });
            }}
        ];
        
        // 获取已解锁的成就
        const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
        
        // 更新成就显示
        const badgeList = document.querySelector('.badge-list');
        if (!badgeList) return;
        
        badgeList.innerHTML = '';
        
        // 显示所有成就
        achievements.forEach(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            const badgeElement = document.createElement('div');
            badgeElement.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
            badgeElement.innerHTML = `
                <div class="badge-icon">${achievement.icon}</div>
                <div class="badge-name">${achievement.name}</div>
                ${isUnlocked ? '<div class="badge-status">已解锁</div>' : '<div class="badge-status">未解锁</div>'}
            `;
            
            badgeList.appendChild(badgeElement);
        });
    }
}

// 初始化成就系统
// 已整合到app.init()中
// document.addEventListener('DOMContentLoaded', () => {
//     initAchievementSystem();
// });

// 实时数据可视化功能
let realtimeUpdateInterval = null;
let isRealtimeUpdateEnabled = true;

// 初始化实时数据面板
function initRealtimeDataPanel() {
    const refreshBtn = document.getElementById('refresh-data-btn');
    const toggleBtn = document.getElementById('toggle-realtime-btn');
    
    // 添加刷新按钮事件
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshData();
            // 添加旋转动画
            refreshBtn.style.animation = 'spin 1s linear';
            setTimeout(() => {
                refreshBtn.style.animation = '';
            }, 1000);
        });
    }
    
    // 添加暂停/恢复按钮事件
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleRealtimeUpdates();
        });
    }
    
    // 初始化数据
    updateRealtimeData();
    
    // 设置自动更新（每30秒）
    realtimeUpdateInterval = setInterval(() => {
        if (isRealtimeUpdateEnabled) {
            updateRealtimeData();
        }
    }, 30000);
}

// 更新实时数据
async function updateRealtimeData() {
    try {
        // 模拟获取充电站状态数据
        const stations = await ApiService.getChargingStations();
        updateStationStatusGrid(stations);
        
        // 模拟获取机器人状态数据
        const robots = await ApiService.getRobots();
        updateRobotStatusGrid(robots);
        
        // 更新系统指标
        updateSystemMetrics();
        
        // 更新最后更新时间
        updateLastUpdateTime();
    } catch (error) {
        console.error('更新实时数据失败:', error);
    }
}

// 刷新数据
function refreshData() {
    updateRealtimeData();
    showMessage(requestMessage, '数据已刷新', true);
}

// 切换实时更新状态
function toggleRealtimeUpdates() {
    const toggleBtn = document.getElementById('toggle-realtime-btn');
    isRealtimeUpdateEnabled = !isRealtimeUpdateEnabled;
    
    if (isRealtimeUpdateEnabled) {
        toggleBtn.textContent = '⏸️';
        toggleBtn.title = '暂停实时更新';
        toggleBtn.classList.add('active');
        showMessage(requestMessage, '已恢复实时更新', true);
    } else {
        toggleBtn.textContent = '▶️';
        toggleBtn.title = '恢复实时更新';
        toggleBtn.classList.remove('active');
        showMessage(requestMessage, '已暂停实时更新', false);
    }
}

// 更新充电站状态网格
function updateStationStatusGrid(stations) {
    const stationStatusGrid = document.getElementById('station-status-grid');
    if (!stationStatusGrid) return;
    
    // 清空现有内容
    stationStatusGrid.innerHTML = '';
    
    // 创建状态卡片
    stations.forEach(station => {
        const statusCard = document.createElement('div');
        const status = station.available > 0 ? 'available' : 'busy';
        const statusText = station.available > 0 ? '可用' : '繁忙';
        
        statusCard.className = `status-card ${status}`;
        statusCard.innerHTML = `
            <div class="status-card-header">
                <span class="status-card-name">${station.name}</span>
                <span class="status-card-status">${statusText}</span>
            </div>
            <div class="status-card-info">
                <span>可用车位: <span class="status-card-value">${station.available}</span></span>
                <span>总车位: <span class="status-card-value">${station.total}</span></span>
            </div>
        `;
        
        // 添加点击事件
        statusCard.addEventListener('click', () => {
            showStationDetails(station.id);
        });
        
        stationStatusGrid.appendChild(statusCard);
    });
}

// 更新机器人状态网格
function updateRobotStatusGrid(robots) {
    const robotStatusGrid = document.getElementById('robot-status-grid');
    if (!robotStatusGrid) return;
    
    // 清空现有内容
    robotStatusGrid.innerHTML = '';
    
    // 创建状态卡片
    robots.forEach(robot => {
        const robotCard = document.createElement('div');
        let stateClass = 'idle';
        let stateText = '空闲';
        
        if (robot.status === '服务中' || robot.status === 'working') {
            stateClass = 'working';
            stateText = '服务中';
        } else if (robot.status === '充电中' || robot.status === 'charging') {
            stateClass = 'charging';
            stateText = '充电中';
        } else if (robot.status === '返回中' || robot.status === 'returning') {
            stateClass = 'returning';
            stateText = '返回中';
        }
        
        robotCard.className = `robot-status-card ${stateClass}`;
        robotCard.innerHTML = `
            <div class="robot-status-header">
                <span class="robot-status-name">${robot.name}</span>
                <span class="robot-status-state">${stateText}</span>
            </div>
            <div class="robot-status-info">
                <span>电量: <span class="robot-status-value">${robot.battery}%</span></span>
                <span>位置: <span class="robot-status-value">${robot.location}</span></span>
            </div>
        `;
        
        // 添加点击事件
        robotCard.addEventListener('click', () => {
            showRobotDetails(robot.id);
        });
        
        robotStatusGrid.appendChild(robotCard);
    });
}

// 更新系统指标
function updateSystemMetrics() {
    // 模拟系统指标数据
    const serverLoad = Math.floor(Math.random() * 40) + 20; // 20-60%
    const networkLatency = Math.floor(Math.random() * 30) + 5; // 5-35ms
    const dbQueries = Math.floor(Math.random() * 100) + 50; // 50-150/s
    
    // 更新服务器负载
    const serverLoadElement = document.getElementById('server-load');
    const serverLoadValue = document.getElementById('server-load-value');
    if (serverLoadElement && serverLoadValue) {
        serverLoadElement.style.width = `${serverLoad}%`;
        serverLoadValue.textContent = `${serverLoad}%`;
        
        // 根据负载设置颜色
        if (serverLoad > 70) {
            serverLoadElement.className = 'metric-fill danger';
        } else if (serverLoad > 50) {
            serverLoadElement.className = 'metric-fill warning';
        } else {
            serverLoadElement.className = 'metric-fill';
        }
    }
    
    // 更新网络延迟
    const networkLatencyElement = document.getElementById('network-latency');
    const networkLatencyValue = document.getElementById('network-latency-value');
    if (networkLatencyElement && networkLatencyValue) {
        const latencyPercent = Math.min(100, networkLatency * 2); // 转换为百分比
        networkLatencyElement.style.width = `${latencyPercent}%`;
        networkLatencyValue.textContent = `${networkLatency}ms`;
        
        // 根据延迟设置颜色
        if (networkLatency > 30) {
            networkLatencyElement.className = 'metric-fill danger';
        } else if (networkLatency > 15) {
            networkLatencyElement.className = 'metric-fill warning';
        } else {
            networkLatencyElement.className = 'metric-fill';
        }
    }
    
    // 更新数据库查询
    const dbQueriesElement = document.getElementById('db-queries');
    const dbQueriesValue = document.getElementById('db-queries-value');
    if (dbQueriesElement && dbQueriesValue) {
        const queriesPercent = Math.min(100, dbQueries / 2); // 转换为百分比
        dbQueriesElement.style.width = `${queriesPercent}%`;
        dbQueriesValue.textContent = `${dbQueries}/s`;
        
        // 根据查询数设置颜色
        if (dbQueries > 120) {
            dbQueriesElement.className = 'metric-fill danger';
        } else if (dbQueries > 80) {
            dbQueriesElement.className = 'metric-fill warning';
        } else {
            dbQueriesElement.className = 'metric-fill';
        }
    }
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const lastUpdateTimeElement = document.getElementById('last-update-time');
    if (lastUpdateTimeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        lastUpdateTimeElement.textContent = timeString;
    }
}

// 移动端充电应用核心逻辑
const app = {
    // 1. 模拟数据 (完善方向：替换为 fetch 请求后端 API)
    data: {
        stations: [
            { id: 1, name: "万达广场地下充电站", distance: "0.5km", price: "1.2", idle: 5, total: 10, type: "快充" },
            { id: 2, name: "市民中心停车场", distance: "1.2km", price: "0.8", idle: 0, total: 8, type: "慢充" },
            { id: 3, name: "科技园E栋充电桩", distance: "3.5km", price: "1.5", idle: 12, total: 20, type: "超级快充" },
            { id: 4, name: "高速路口服务区", distance: "5.0km", price: "1.8", idle: 3, total: 4, type: "快充" }
        ],
        currentUser: {
            isLoggedIn: true,
            name: "User_9527",
            balance: 128.00
        }
    },
    
    // 2. 路由控制 (SPA 核心)
    router: {
        init: function() {
            // 默认显示首页
            this.go('home-view');
        },
        
        // 切换到底部导航对应的页面
        switchTab: function(element) {
            // 1. 处理导航样式
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            element.classList.add('active');
            
            // 2. 获取目标视图 ID
            const targetId = element.getAttribute('data-target');
            this.go(targetId);
            
            // 3. 更新标题
            const titleMap = { 'home-view': '首页', 'list-view': '附近电桩', 'profile-view': '个人中心' };
            document.getElementById('page-title').innerText = titleMap[targetId];
        },
        
        // 执行页面切换
        go: function(pageId) {
            // 隐藏所有页面
            document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
            
            // 显示目标页面
            const targetPage = document.getElementById(pageId);
            if(targetPage) {
                targetPage.classList.add('active');
                
                // 如果是列表页，触发数据加载
                if (pageId === 'list-view') {
                    app.services.loadStations();
                }
            }
        }
    },
    
    // 3. 业务服务
    services: {
        // 加载充电桩数据
        loadStations: function() {
            const listContainer = document.getElementById('station-list');
            
            // 模拟网络延迟 (用户体验优化)
            listContainer.innerHTML = '<div style="text-align:center;padding:20px;color:#999">正在搜索附近电桩...</div>';
            
            setTimeout(() => {
                let html = '';
                app.data.stations.forEach(station => {
                    const statusColor = station.idle > 0 ? '#34c759' : '#ff3b30';
                    const statusText = station.idle > 0 ? `空闲 ${station.idle}/${station.total}` : '已满';
                    
                    html += `
                    <div class="station-card" onclick="alert('即将导航到：${station.name}')">
                        <div class="station-info">
                            <h4>${station.name}</h4>
                            <span class="tag">${station.type}</span>
                            <span class="distance"><i class="fa-solid fa-location-arrow"></i> ${station.distance}</span>
                        </div>
                        <div class="station-status">
                            <div class="price">¥${station.price}/度</div>
                            <div style="color:${statusColor};font-size:12px;margin-top:5px;">${statusText}</div>
                        </div>
                    </div>
                    `;
                });
                
                listContainer.innerHTML = html;
            }, 600); // 600ms 延迟
        }
    },
    
    // 4. 用户认证 (完善方向：对接后端 Token)
    auth: { 
        login: function() { 
            // 简单模拟 
            const confirmLogin = confirm("模拟登录：点击确定登录"); 
            if(confirmLogin) { 
                app.data.currentUser.isLoggedIn = true; 
                this.updateUI(); 
            } 
        },
        
        logout: function() {
            const confirmLogout = confirm("确定要退出登录吗？");
            if(confirmLogout) {
                app.data.currentUser.isLoggedIn = false;
                this.updateUI();
            }
        },
        
        updateUI: function() { 
            // 根据登录状态切换 UI 显示
            const isLoggedIn = app.data.currentUser.isLoggedIn;
            
            // 更新个人中心页面的显示
            const profilePage = document.getElementById('profile-page');
            if (profilePage) {
                // 如果有登录状态相关的元素，在这里进行切换
                // 当前实现中，个人中心页面总是显示用户信息
                // 在实际应用中，可能需要根据登录状态显示不同的内容
                
                // 可以根据需要添加登录/退出按钮
                let authButton = document.getElementById('auth-button');
                if (!authButton) {
                    // 如果没有认证按钮，可以创建一个
                    const userInfo = profilePage.querySelector('.user-info');
                    if (userInfo) {
                        authButton = document.createElement('button');
                        authButton.id = 'auth-button';
                        authButton.className = 'auth-button';
                        userInfo.appendChild(authButton);
                    }
                }
                
                if (authButton) {
                    if (isLoggedIn) {
                        authButton.textContent = '退出登录';
                        authButton.onclick = this.logout.bind(this);
                    } else {
                        authButton.textContent = '点击登录';
                        authButton.onclick = this.login.bind(this);
                    }
                }
            }
            
            // 更新导航栏中的用户状态显示（如果有）
            const navItems = document.querySelectorAll('.nav-item[data-page="profile-page"]');
            navItems.forEach(item => {
                if (isLoggedIn) {
                    // 可以添加已登录的样式或标识
                    item.classList.add('user-logged-in');
                } else {
                    item.classList.remove('user-logged-in');
                }
            });
            
            // 更新需要登录才能访问的功能
            const loginRequiredElements = document.querySelectorAll('.login-required');
            loginRequiredElements.forEach(element => {
                element.style.display = isLoggedIn ? 'block' : 'none';
            });
            
            // 更新未登录时显示的提示元素
            const notLoggedInElements = document.querySelectorAll('.not-logged-in');
            notLoggedInElements.forEach(element => {
                element.style.display = isLoggedIn ? 'none' : 'block';
            });
            
            // 更新已登录时显示的元素
            const loggedInElements = document.querySelectorAll('.logged-in');
            loggedInElements.forEach(element => {
                element.style.display = isLoggedIn ? 'block' : 'none';
            });
        } 
    },
    
    init: function() { 
        console.log("App Initialized"); 
        
        // 性能优化：预加载关键资源
        preloadCriticalResources();
        
        // 性能优化：懒加载非关键资源
        lazyLoadNonCriticalResources();
        
        // 性能优化：减少重绘和回流
        optimizeRendering();
        
        // 性能优化：内存管理
        optimizeMemoryUsage();
        
        // 初始化性能监控面板
        initPerformancePanel();
        
        // 初始化路由系统
        this.router.init(); 
        
        // 调用原来的initApp函数中的初始化逻辑
        if (typeof initApp === 'function') {
            initApp();
        }
        
        // 页面加载性能监控
        const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        if (typeof performanceMonitor !== 'undefined') {
            performanceMonitor.recordPageLoad('app', pageLoadTime);
            
            // 如果加载时间过长，记录警告
            if (pageLoadTime > 3000) {
                console.warn(`页面加载时间过长: ${pageLoadTime}ms`);
            }
        }
        
        // 增强表单
        if (typeof enhanceVehicleForm === 'function') {
            enhanceVehicleForm();
        }
        if (typeof enhancePaymentForm === 'function') {
            enhancePaymentForm();
        }
        
        // 初始化成就系统
        if (typeof initAchievementSystem === 'function') {
            initAchievementSystem();
        }
        
        // 初始化系统级控制与调度平台
        initControlCenter();
        
        // 定期更新性能面板（如果可见）
        const performancePanel = document.getElementById('performance-panel');
        if (performancePanel) {
            setInterval(() => {
                if (performancePanel.classList.contains('visible')) {
                    if (typeof updatePerformancePanel === 'function') {
                        updatePerformancePanel();
                    }
                }
            }, 1000);
        }
    } 
}; 

// 启动应用 
document.addEventListener('DOMContentLoaded', () => { 
    app.init(); 
});

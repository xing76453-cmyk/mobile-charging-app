// 修复导航和按钮交互问题的脚本
// 将在script.js之后加载

console.log('导航修复脚本加载中...');

// 备用导航方法
function fallbackNavigation(pageId, activeNavItem) {
    console.log(`使用备用导航方法切换到 ${pageId}`);
    
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log(`页面 ${pageId} 已激活`);
    } else {
        console.error(`无法找到页面 ${pageId}`);
        return;
    }
    
    // 更新导航状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => navItem.classList.remove('active'));
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

// 确保DOM完全加载后再执行修复
document.addEventListener('DOMContentLoaded', function() {
    console.log('导航修复脚本开始执行...');
    
    // 等待一小段时间确保原始脚本初始化完成
    setTimeout(() => {
        // 1. 重新初始化导航事件监听
        const navItems = document.querySelectorAll('.nav-item');
        console.log(`找到 ${navItems.length} 个导航项，重新绑定事件...`);
        
        navItems.forEach(item => {
            const pageId = item.getAttribute('data-page');
            if (pageId) {
                // 移除现有事件监听器
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                // 添加新的事件监听器
                newItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`导航点击: ${pageId}`);
                    
                    // 检查页面是否存在
                    const targetPage = document.getElementById(pageId);
                    if (!targetPage) {
                        console.error(`页面 ${pageId} 不存在`);
                        return;
                    }
                    
                    // 使用路由系统导航
                    if (typeof router !== 'undefined' && router.navigateTo) {
                        // 检查路由系统是否知道这个页面
                        if (router.pages && router.pages.has(pageId)) {
                            router.navigateTo(pageId);
                        } else {
                            console.warn(`路由系统不知道页面 ${pageId}，尝试重新收集页面`);
                            router.collectPages();
                            if (router.pages.has(pageId)) {
                                router.navigateTo(pageId);
                            } else {
                                console.error(`路由系统仍然不知道页面 ${pageId}，使用备用方法`);
                                fallbackNavigation(pageId, newItem);
                            }
                        }
                    } else {
                        // 备用导航方法
                        console.warn('路由系统不可用，使用备用导航方法');
                        fallbackNavigation(pageId, newItem);
                    }
                });
            }
        });
        
        // 2. 修复其他按钮交互
        const buttons = document.querySelectorAll('button:not(.nav-item)');
        console.log(`找到 ${buttons.length} 个按钮，检查交互...`);
        
        // 3. 添加调试函数
        window.testNavigation = function(pageId) {
            console.log(`测试导航到页面: ${pageId}`);
            if (typeof router !== 'undefined' && router.navigateTo) {
                router.navigateTo(pageId);
            } else {
                console.error('路由系统不可用');
            }
        };
        
        window.checkNavigation = function() {
            console.log('=== 导航系统检查 ===');
            console.log('路由系统:', typeof router !== 'undefined' ? '可用' : '不可用');
            
            const pages = document.querySelectorAll('.page');
            console.log(`找到 ${pages.length} 个页面`);
            pages.forEach(page => {
                console.log(`- ${page.id}: ${page.classList.contains('active') ? '活动' : '非活动'}`);
            });
            
            const navItems = document.querySelectorAll('.nav-item');
            console.log(`找到 ${navItems.length} 个导航项`);
            navItems.forEach(item => {
                const pageId = item.getAttribute('data-page');
                console.log(`- ${pageId}: ${item.classList.contains('active') ? '活动' : '非活动'}`);
            });
        };
        
        console.log('导航修复脚本执行完成');
        console.log('使用 testNavigation("页面ID") 测试导航');
        console.log('使用 checkNavigation() 检查导航状态');
    }, 1000);
});
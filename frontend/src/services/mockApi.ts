// Mock API服务 - 用于演示和测试
class MockApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 模拟用户数据
  async login(credentials: { email: string; password: string }) {
    await this.delay(1000);
    
    // 模拟登录验证
    if (credentials.email === 'student@hnu.edu.cn' && credentials.password === '123456') {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: '1',
            username: 'HNU学生',
            email: 'student@hnu.edu.cn',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            isStudentVerified: true,
            isBlueCardMember: false,
            bio: '湖南大学在校学生，热爱分享生活～',
            major: '计算机科学与技术',
            className: '计科2021-1班',
            phone: '138****8888',
            qqNumber: '888888888'
          }
        }
      };
    }
    
    throw new Error('用户名或密码错误');
  }

  // 模拟帖子数据
  async getPosts(params: any = {}) {
    await this.delay(800);
    
    const mockPosts = [
      {
        id: '1',
        title: '湖南大学2024年春季学期选课指南',
        content: '新学期选课开始了，为大家整理了一份详细的选课攻略...',
        category: '学习交流',
        tags: ['选课', '攻略', '新学期'],
        author: {
          id: '1',
          username: 'HNU学长',
          avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
          isStudentVerified: true
        },
        stats: { views: 1234, likes: 89, comments: 23 },
        createdAt: '2024-03-15T10:30:00Z',
        images: ['https://picsum.photos/400/300?random=1']
      },
      {
        id: '2',
        title: '岳麓山赏樱花最佳地点推荐',
        content: '春天来了，岳麓山的樱花开得正美，给大家推荐几个拍照的好地方...',
        category: '校园生活',
        tags: ['樱花', '岳麓山', '拍照'],
        author: {
          id: '2',
          username: '摄影爱好者',
          avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
          isStudentVerified: true
        },
        stats: { views: 2156, likes: 156, comments: 34 },
        createdAt: '2024-03-14T15:20:00Z',
        images: ['https://picsum.photos/400/300?random=2', 'https://picsum.photos/400/300?random=3']
      },
      {
        id: '3',
        title: '求助：数据结构作业有不会的地方',
        content: '有没有学长学姐帮忙看看这道二叉树的题目，卡了好久了...',
        category: '求助互助',
        tags: ['数据结构', '作业', '求助'],
        author: {
          id: '3',
          username: '计科萌新',
          avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
          isStudentVerified: true
        },
        stats: { views: 567, likes: 23, comments: 12 },
        createdAt: '2024-03-13T20:10:00Z',
        isUrgent: true
      }
    ];

    return {
      success: true,
      data: {
        items: mockPosts,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 10,
          total: 50
        }
      }
    };
  }

  // 模拟快递代拿数据
  async getExpressOrders(params: any = {}) {
    await this.delay(600);
    
    const mockOrders = [
      {
        id: '1',
        type: 'pickup',
        title: '申通快递代取 - 菜鸟驿站',
        description: '包裹比较重，大概5公斤左右，感谢帮忙～',
        location: '东门菜鸟驿站',
        pickupCode: 'ST123456',
        fee: 5,
        status: 'pending',
        client: {
          username: '忙碌的研究生',
          dormitory: '研究生公寓A栋',
          phone: '139****7777'
        },
        createdAt: '2024-03-15T09:30:00Z',
        deadline: '2024-03-15T18:00:00Z'
      },
      {
        id: '2',
        type: 'delivery',
        title: '中通快递代寄 - 寄回家的特产',
        description: '帮忙把湖南特产寄回老家，包装好了',
        location: '南门快递点',
        fee: 8,
        status: 'accepted',
        client: {
          username: '湖南土著',
          dormitory: '学生公寓15栋',
          phone: '138****6666'
        },
        accepter: {
          username: '热心跑腿员',
          phone: '137****5555'
        },
        createdAt: '2024-03-14T14:20:00Z',
        deadline: '2024-03-15T12:00:00Z'
      }
    ];

    return {
      success: true,
      data: {
        items: mockOrders,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 10,
          total: 25
        }
      }
    };
  }

  // 模拟失物招领数据
  async getLostFoundItems(params: any = {}) {
    await this.delay(700);
    
    const mockItems = [
      {
        id: '1',
        type: 'lost',
        title: '丢失校园卡 - 姓名：张三',
        description: '今天上午在图书馆丢失了校园卡，卡号末位是1234，上面贴了一张小贴纸',
        category: 'cards',
        location: {
          area: '图书馆',
          specific: '二楼阅览室'
        },
        lostDate: '2024-03-15',
        reward: 20,
        status: 'active',
        poster: {
          id: '1',
          username: '丢卡的同学',
          avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
          isStudentVerified: true
        },
        stats: { views: 89, contacts: 3 },
        createdAt: '2024-03-15T11:00:00Z',
        images: ['https://picsum.photos/300/200?random=4']
      },
      {
        id: '2',
        type: 'found',
        title: '捡到苹果耳机 - AirPods Pro',
        description: '在体育馆篮球场捡到一副AirPods Pro，充电盒有些划痕',
        category: 'electronics',
        location: {
          area: '体育馆',
          specific: '篮球场'
        },
        lostDate: '2024-03-14',
        status: 'active',
        poster: {
          id: '2',
          username: '拾金不昧',
          avatar: 'https://avatars.githubusercontent.com/u/6?v=4',
          isStudentVerified: true
        },
        stats: { views: 156, contacts: 8 },
        createdAt: '2024-03-14T16:30:00Z',
        images: ['https://picsum.photos/300/200?random=5']
      }
    ];

    return {
      success: true,
      data: {
        items: mockItems,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 10,
          total: 30
        }
      }
    };
  }

  // 模拟跳蚤市场数据
  async getMarketItems(params: any = {}) {
    await this.delay(900);
    
    const mockItems = [
      {
        id: '1',
        title: 'MacBook Pro 13寸 2021款',
        description: '9成新MacBook Pro，M1芯片，16GB内存，512GB存储，使用时间不到一年，因为换了新电脑所以出售',
        price: 8800,
        originalPrice: 12000,
        isNegotiable: true,
        condition: 'like_new',
        category: 'electronics',
        location: '校内交易',
        tags: ['MacBook', '笔记本', 'M1'],
        status: 'available',
        seller: {
          id: '1',
          username: '准毕业生',
          avatar: 'https://avatars.githubusercontent.com/u/7?v=4',
          isStudentVerified: true,
          rating: 4.8,
          salesCount: 5
        },
        stats: { views: 234, likes: 28, messages: 12 },
        createdAt: '2024-03-13T10:00:00Z',
        images: ['https://picsum.photos/400/300?random=6', 'https://picsum.photos/400/300?random=7']
      },
      {
        id: '2',
        title: '高数教材《高等数学》同济版',
        description: '高等数学上下册，同济大学出版社，9成新，内容完整无缺页，有少量笔记',
        price: 45,
        originalPrice: 89,
        isNegotiable: false,
        condition: 'good',
        category: 'books',
        location: '宿舍区',
        tags: ['教材', '高数', '同济版'],
        status: 'available',
        seller: {
          id: '2',
          username: '数学小能手',
          avatar: 'https://avatars.githubusercontent.com/u/8?v=4',
          isStudentVerified: true,
          rating: 5.0,
          salesCount: 12
        },
        stats: { views: 128, likes: 15, messages: 6 },
        createdAt: '2024-03-12T14:30:00Z',
        images: ['https://picsum.photos/400/300?random=8']
      }
    ];

    return {
      success: true,
      data: {
        items: mockItems,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 12,
          total: 45
        }
      }
    };
  }
}

export const mockApi = new MockApiService();
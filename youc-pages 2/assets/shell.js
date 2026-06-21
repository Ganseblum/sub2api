/* YOUC shell: renders sidebar + topbar from window.PAGE, powers UI components */
(function () {
  var I = {
    dashboard:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    key:'M15 7a4 4 0 11-3.8 5.2L4 19v2H2v-2l1-1v-2h2v-2l3.8-3.8A4 4 0 0115 7z',
    chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
    channel:'M3 7l9-4 9 4-9 4zM3 7v6l9 4 9-4V7',
    signal:'M3 17a14 14 0 0118 0M6 14a9 9 0 0112 0M9 11a4 4 0 016 0M12 20h.01',
    card:'M2 6h20v12H2zM2 10h20',
    recharge:'M21 12a9 9 0 11-3-6.7M21 4v5h-5',
    order:'M5 3h11l3 3v15H5zM9 8h6M9 12h6M9 16h4',
    gift:'M3 11h18v9H3zM3 7h18v4H3zM12 7v13M12 7a3 3 0 10-3-3 3 3 0 003 3zm0 0a3 3 0 113-3 3 3 0 01-3 3z',
    users:'M16 18a4 4 0 00-8 0M12 11a3 3 0 100-6 3 3 0 000 6M20 18a3 3 0 00-3-3M4 18a3 3 0 013-3',
    user:'M16 18a4 4 0 00-8 0M12 11a3 3 0 100-6 3 3 0 000 6',
    folder:'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    globe:'M12 3a9 9 0 100 18 9 9 0 000-18M3 12h18M12 3a14 14 0 000 18M12 3a14 14 0 010 18',
    bell:'M18 9a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6M10 21a2 2 0 004 0',
    server:'M3 5h18v6H3zM3 13h18v6H3zM7 8h.01M7 16h.01',
    shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    ticket:'M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4zM9 7v10',
    cog:'M12 9a3 3 0 100 6 3 3 0 000-6M19 12l2-1-1-3-2 .5-1.5-1.5L17 4l-3-1-1 2h-2l-1-2-3 1 .5 2.5L5 8l-2-.5-1 3 2 1v0l-2 1 1 3 2-.5 1.5 1.5L7 20l3 1 1-2h2l1 2 3-1-.5-2.5L17 16l2 .5 1-3z',
    price:'M3 3h9l9 9-9 9-9-9zM8 8h.01'
  };
  function ic(n){return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+(I[n]||I.dashboard)+'"/></svg>';}

  var userNav = [
    {sec:''},
    {p:'/dashboard',l:'仪表盘',i:'dashboard'},
    {p:'/keys',l:'API 密钥',i:'key'},
    {p:'/usage',l:'使用记录',i:'chart'},
    {p:'/available-channels',l:'可用渠道',i:'channel'},
    {p:'/monitor',l:'渠道状态',i:'signal'},
    {p:'/subscriptions',l:'我的订阅',i:'card'},
    {p:'/purchase',l:'充值/订阅',i:'recharge'},
    {p:'/orders',l:'我的订单',i:'order'},
    {p:'/redeem',l:'兑换',i:'gift'},
    {p:'/affiliate',l:'邀请返利',i:'users'},
    {p:'/profile',l:'个人资料',i:'user'}
  ];
  var adminNav = [
    {sec:'管理'},
    {p:'/admin/dashboard',l:'仪表盘',i:'dashboard'},
    {p:'/admin/ops',l:'运维监控',i:'chart'},
    {p:'/admin/users',l:'用户管理',i:'users'},
    {p:'/admin/groups',l:'分组管理',i:'folder'},
    {l:'渠道管理',i:'channel',children:[
      {p:'/admin/channels/pricing',l:'渠道定价',i:'price'},
      {p:'/admin/channels/monitor',l:'渠道监控',i:'signal'}
    ]},
    {p:'/admin/subscriptions',l:'订阅管理',i:'card'},
    {p:'/admin/accounts',l:'账号管理',i:'globe'},
    {p:'/admin/announcements',l:'公告',i:'bell'},
    {p:'/admin/proxies',l:'IP 管理',i:'server'},
    {p:'/admin/risk-control',l:'风控中心',i:'shield'},
    {p:'/admin/redeem',l:'兑换码',i:'ticket'},
    {p:'/admin/promo-codes',l:'优惠码',i:'gift'},
    {l:'邀请返利',i:'users',children:[
      {p:'/admin/affiliates/invites',l:'邀请记录',i:'users'},
      {p:'/admin/affiliates/rebates',l:'返利记录',i:'order'},
      {p:'/admin/affiliates/transfers',l:'提取记录',i:'card'}
    ]},
    {l:'订单管理',i:'order',children:[
      {p:'/admin/orders/dashboard',l:'支付概览',i:'chart'},
      {p:'/admin/orders',l:'订单管理',i:'order'},
      {p:'/admin/orders/plans',l:'订阅套餐',i:'card'}
    ]},
    {p:'/admin/usage',l:'使用记录',i:'chart'},
    {sec:'我的账户'},
    {p:'/keys',l:'API 密钥',i:'key'},
    {p:'/profile',l:'个人资料',i:'user'},
    {p:'/admin/settings',l:'系统设置',i:'cog'}
  ];

  var P = window.PAGE || {};
  var nav = P.shell === 'admin' ? adminNav : userNav;
  var active = P.active || '';

  function navHtml(){
    var h = '';
    nav.forEach(function(it){
      if (it.sec !== undefined){ if(it.sec) h += '<div class="sb-sec">'+it.sec+'</div>'; return; }
      if (it.children){
        var open = it.children.some(function(c){return c.p===active});
        h += '<div class="sb-link'+(open?' active':'')+'">'+ic(it.i)+'<span>'+it.l+'</span><span class="ch">▸</span></div>';
        h += '<div class="sb-sub">';
        it.children.forEach(function(c){
          h += '<a class="sb-link'+(c.p===active?' active':'')+'" href="'+page(c.p)+'">'+ic(c.i)+'<span>'+c.l+'</span></a>';
        });
        h += '</div>';
        return;
      }
      h += '<a class="sb-link'+(it.p===active?' active':'')+'" href="'+page(it.p)+'">'+ic(it.i)+'<span>'+it.l+'</span></a>';
    });
    return h;
  }
  // map route path -> static file
  function page(p){
    var m = {
      '/dashboard':'user-dashboard','/keys':'user-keys','/usage':'user-usage',
      '/available-channels':'user-available-channels','/monitor':'user-channel-status',
      '/subscriptions':'user-subscriptions','/purchase':'user-purchase','/orders':'user-orders',
      '/redeem':'user-redeem','/affiliate':'user-affiliate','/profile':'user-profile',
      '/admin/dashboard':'admin-dashboard','/admin/ops':'admin-ops','/admin/users':'admin-users',
      '/admin/groups':'admin-groups','/admin/channels/pricing':'admin-channels','/admin/channels/monitor':'admin-channel-monitor',
      '/admin/subscriptions':'admin-subscriptions','/admin/accounts':'admin-accounts','/admin/announcements':'admin-announcements',
      '/admin/proxies':'admin-proxies','/admin/risk-control':'admin-risk-control','/admin/redeem':'admin-redeem',
      '/admin/promo-codes':'admin-promo-codes','/admin/affiliates/invites':'admin-affiliate-invites',
      '/admin/affiliates/rebates':'admin-affiliate-rebates','/admin/affiliates/transfers':'admin-affiliate-transfers',
      '/admin/orders/dashboard':'admin-payment-dashboard','/admin/orders':'admin-orders','/admin/orders/plans':'admin-plans',
      '/admin/usage':'admin-usage','/admin/settings':'admin-settings'
    };
    return (m[p]||'index')+'.html';
  }

  var sb = document.getElementById('sidebar');
  if (sb){
    sb.className = 'sidebar';
    sb.innerHTML =
      '<div class="sb-head"><span class="sb-mark">YC</span><span class="sb-name">YOUC</span><span class="sb-ver">v2.6</span></div>'+
      '<div class="sb-nav">'+navHtml()+'</div>'+
      '<div class="sb-foot">'+
        '<button class="btn btn-sm btn-block">浅色模式</button>'+
        '<button class="btn btn-sm btn-block btn-ghost">退出登录</button>'+
      '</div>';
  }
  var tb = document.getElementById('topbar');
  if (tb){
    tb.className = 'topbar';
    tb.innerHTML =
      '<div class="tb-title"><b>'+(P.title||'')+'</b><span>'+(P.idx||'')+'</span></div>'+
      '<div class="tb-right">'+
        '<div class="tb-search">'+ic('chart').replace('class="ic"','class="ic" style="width:15px;height:15px;opacity:.5"')+'<input placeholder="搜索…"></div>'+
        '<div class="iconbtn">'+ic('bell')+'<span class="nd">3</span></div>'+
        '<div class="dropdown"><div class="avatar" data-menu>JD</div>'+
          '<div class="menu"><a href="user-profile.html">'+ic('user')+'个人资料</a><a href="user-orders.html">'+ic('order')+'我的订单</a><div class="sep"></div><a class="danger" href="login.html">退出登录</a></div>'+
        '</div>'+
      '</div>';
  }

  /* ---------- interactions ---------- */
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-menu]');
    // close all menus first
    var openMenus = document.querySelectorAll('.menu.open');
    if (t){
      var menu = t.parentNode.querySelector('.menu');
      var wasOpen = menu.classList.contains('open');
      openMenus.forEach(function(m){m.classList.remove('open')});
      if(!wasOpen) menu.classList.add('open');
      e.stopPropagation();
      return;
    }
    if(!e.target.closest('.menu')) openMenus.forEach(function(m){m.classList.remove('open')});

    var op = e.target.closest('[data-open]');
    if (op){ var ov=document.getElementById(op.getAttribute('data-open')); if(ov) ov.classList.add('open'); }
    var cl = e.target.closest('[data-close]');
    if (cl){ var o=cl.closest('.overlay'); if(o) o.classList.remove('open'); }
    if (e.target.classList.contains('overlay')) e.target.classList.remove('open');

    var tg = e.target.closest('.toggle');
    if (tg) tg.classList.toggle('on');

    var tab = e.target.closest('[data-tab]');
    if (tab){
      var grp = tab.parentNode;
      grp.querySelectorAll('[data-tab]').forEach(function(x){x.classList.remove('active')});
      tab.classList.add('active');
      var pane = tab.getAttribute('data-tab');
      var host = document.querySelector('[data-tabhost="'+(grp.getAttribute('data-tabs')||'')+'"]');
      if (host){ host.querySelectorAll('[data-pane]').forEach(function(p){p.style.display = p.getAttribute('data-pane')===pane?'':'none'}); }
    }
    var tt = e.target.closest('[data-toast]');
    if (tt) toast(tt.getAttribute('data-toast') || 'ok', tt.getAttribute('data-toast-title')||'操作成功', tt.getAttribute('data-toast-msg')||'');
  });

  window.toast = function(kind, title, msg){
    var box = document.querySelector('.toasts');
    if(!box){ box = document.createElement('div'); box.className='toasts'; document.body.appendChild(box); }
    var el = document.createElement('div');
    el.className = 'toast '+kind;
    el.innerHTML = '<div class="bar"></div><div><b>'+title+'</b>'+(msg?'<p>'+msg+'</p>':'')+'</div>';
    box.appendChild(el);
    setTimeout(function(){ el.style.opacity='0'; el.style.transition='.3s'; setTimeout(function(){el.remove()},300); }, 2800);
  };
})();

#!/usr/bin/env node
// service-manager.js - 跨平台服务管理器
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 服务配置
const SERVICES = {
  collector: {
    name: '数据采集',
    command: 'node',
    args: ['index.js', 'all'],
    cwd: __dirname,
    port: null,
    pidFile: '.collector.pid'
  },
  api: {
    name: 'API服务器',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, 'api-server'),
    port: 8080,
    pidFile: '.api.pid'
  },
  web: {
    name: '前端网站',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'web'),
    port: 3000,
    pidFile: '.web.pid'
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查端口是否被占用
async function isPortInUse(port) {
  if (!port) return false;
  
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} || netstat -tuln | grep :${port}`);
      return stdout.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
}

// 获取端口占用的 PID
async function getPortPid(port) {
  if (!port) return null;
  
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        return pid ? parseInt(pid) : null;
      }
      return null;
    } else {
      const { stdout } = await execAsync(`lsof -ti :${port} 2>/dev/null || echo ""`);
      const pid = stdout.trim().split('\n')[0];
      return pid ? parseInt(pid) : null;
    }
  } catch (error) {
    return null;
  }
}

// 检查进程是否运行
async function isProcessRunning(pid) {
  if (!pid) return false;
  
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /NH`);
      return stdout.includes(pid.toString());
    } else {
      await execAsync(`ps -p ${pid}`);
      return true;
    }
  } catch (error) {
    return false;
  }
}

// 杀死进程
async function killProcess(pid) {
  if (!pid) return false;
  
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      await execAsync(`taskkill /F /PID ${pid}`);
    } else {
      await execAsync(`kill -9 ${pid}`);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// 检查服务状态
async function checkServiceStatus(serviceKey) {
  const service = SERVICES[serviceKey];
  
  if (service.port) {
    const inUse = await isPortInUse(service.port);
    if (inUse) {
      const pid = await getPortPid(service.port);
      return { running: true, pid: pid || 'unknown', port: service.port };
    }
  }
  
  return { running: false, pid: null, port: service.port };
}

// 启动服务
async function startService(serviceKey) {
  const service = SERVICES[serviceKey];
  
  log(`\n🚀 正在启动 ${service.name}...`, 'cyan');
  
  const isWindows = process.platform === 'win32';
  
  try {
    if (isWindows) {
      // Windows: 使用批处理脚本启动
      const scriptMap = {
        'collector': 'scripts\\启动-数据采集.bat',
        'api': 'scripts\\启动-API.bat',
        'web': 'scripts\\启动-前端.bat'
      };
      
      const scriptPath = scriptMap[serviceKey];
      if (scriptPath) {
        // 使用 start 命令在新窗口运行批处理脚本
        exec(`start "${service.name}" cmd /c "${scriptPath}"`);
      } else {
        // 回退到直接命令
        const cmdArgs = [service.command, ...service.args].join(' ');
        exec(`start "${service.name}" cmd /c "cd /d ${service.cwd} && ${cmdArgs}"`);
      }
    } else {
      // Linux/macOS: 使用 shell 脚本或直接命令
      const cmdArgs = [service.command, ...service.args].join(' ');
      exec(`cd ${service.cwd} && nohup ${cmdArgs} > /dev/null 2>&1 &`);
    }
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // 检查服务状态
    const status = await checkServiceStatus(serviceKey);
    if (status.running) {
      log(`✅ ${service.name} 启动成功 (PID: ${status.pid})`, 'green');
      if (status.port) {
        log(`   访问地址: http://localhost:${status.port}`, 'blue');
      }
      return status;
    } else {
      log(`⚠️  ${service.name} 可能未成功启动，请检查新打开的窗口`, 'yellow');
      return { running: false };
    }
  } catch (error) {
    log(`❌ ${service.name} 启动失败: ${error.message}`, 'red');
    return { running: false };
  }
}

// 停止服务
async function stopService(serviceKey) {
  const service = SERVICES[serviceKey];
  const status = await checkServiceStatus(serviceKey);
  
  if (!status.running) {
    log(`ℹ️  ${service.name} 未运行`, 'yellow');
    return false;
  }
  
  log(`\n🛑 正在停止 ${service.name} (PID: ${status.pid})...`, 'cyan');
  
  const killed = await killProcess(status.pid);
  if (killed) {
    log(`✅ ${service.name} 已停止`, 'green');
    return true;
  } else {
    log(`❌ ${service.name} 停止失败`, 'red');
    return false;
  }
}

// 显示所有服务状态
async function showStatus() {
  log('\n' + '='.repeat(60), 'bright');
  log('  服务状态', 'bright');
  log('='.repeat(60), 'bright');
  
  for (const [key, service] of Object.entries(SERVICES)) {
    const status = await checkServiceStatus(key);
    const statusText = status.running ? '🟢 运行中' : '⚫ 已停止';
    
    log(`\n${service.name}:`, 'bright');
    log(`  状态: ${statusText}`);
    if (status.running) {
      if (status.pid && status.pid !== 'unknown') {
        log(`  PID: ${status.pid}`);
      }
      if (status.port) {
        log(`  端口: ${status.port}`);
      }
    }
  }
  
  log('\n' + '='.repeat(60), 'bright');
}

// 启动所有服务
async function startAll() {
  log('\n🚀 启动所有服务...', 'bright');
  
  for (const [key, service] of Object.entries(SERVICES)) {
    const status = await checkServiceStatus(key);
    
    if (status.running) {
      log(`\nℹ️  ${service.name} 已在运行 (PID: ${status.pid})`, 'yellow');
    } else {
      await startService(key);
    }
  }
  
  log('\n✨ 所有服务已启动！', 'green');
  await showStatus();
}

// 停止所有服务
async function stopAll() {
  log('\n🛑 停止所有服务...', 'bright');
  
  for (const [key] of Object.entries(SERVICES)) {
    await stopService(key);
  }
  
  log('\n✨ 所有服务已停止！', 'green');
}

// 交互式菜单
async function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  while (true) {
    await showStatus();
    
    log('\n📋 操作菜单:', 'bright');
    log('  1. 启动所有服务');
    log('  2. 停止所有服务');
    log('  3. 启动数据采集');
    log('  4. 启动API服务器');
    log('  5. 启动前端网站');
    log('  6. 停止数据采集');
    log('  7. 停止API服务器');
    log('  8. 停止前端网站');
    log('  9. 刷新状态');
    log('  0. 退出');
    
    const answer = await question('\n请选择操作 (0-9): ');
    
    switch (answer.trim()) {
      case '1':
        await startAll();
        break;
      case '2':
        await stopAll();
        break;
      case '3':
        await startService('collector');
        break;
      case '4':
        await startService('api');
        break;
      case '5':
        await startService('web');
        break;
      case '6':
        await stopService('collector');
        break;
      case '7':
        await stopService('api');
        break;
      case '8':
        await stopService('web');
        break;
      case '9':
        // 刷新状态（循环会自动显示）
        break;
      case '0':
        log('\n👋 再见！', 'cyan');
        rl.close();
        process.exit(0);
      default:
        log('\n❌ 无效的选择，请重试', 'red');
    }
    
    await question('\n按回车继续...');
  }
}

// 命令行参数处理
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  log('\n' + '='.repeat(60), 'bright');
  log('  异世界女团粉丝站 - 服务管理器', 'bright');
  log('='.repeat(60), 'bright');
  
  if (!command) {
    // 无参数，显示交互式菜单
    await showMenu();
    return;
  }
  
  switch (command) {
    case 'start':
      await startAll();
      break;
    case 'stop':
      await stopAll();
      break;
    case 'status':
      await showStatus();
      break;
    case 'restart':
      await stopAll();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await startAll();
      break;
    case 'start:collector':
      await startService('collector');
      break;
    case 'start:api':
      await startService('api');
      break;
    case 'start:web':
      await startService('web');
      break;
    case 'stop:collector':
      await stopService('collector');
      break;
    case 'stop:api':
      await stopService('api');
      break;
    case 'stop:web':
      await stopService('web');
      break;
    case 'help':
      log('\n使用方法:', 'bright');
      log('  node service-manager.js              交互式菜单');
      log('  node service-manager.js start        启动所有服务');
      log('  node service-manager.js stop         停止所有服务');
      log('  node service-manager.js restart      重启所有服务');
      log('  node service-manager.js status       查看服务状态');
      log('  node service-manager.js start:collector   启动数据采集');
      log('  node service-manager.js start:api         启动API服务器');
      log('  node service-manager.js start:web         启动前端网站');
      log('  node service-manager.js stop:collector    停止数据采集');
      log('  node service-manager.js stop:api          停止API服务器');
      log('  node service-manager.js stop:web          停止前端网站');
      log('  node service-manager.js help              显示帮助\n');
      break;
    default:
      log(`\n❌ 未知命令: ${command}`, 'red');
      log('使用 "node service-manager.js help" 查看帮助\n', 'yellow');
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  log('\n\n👋 收到退出信号，再见！', 'cyan');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n👋 收到终止信号，再见！', 'cyan');
  process.exit(0);
});

// 启动
main().catch((error) => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  process.exit(1);
});

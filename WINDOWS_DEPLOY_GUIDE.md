# Windows 11 本地私有化 AI 部署指南 (RTX 2060 6G 专版)

根据您的硬件配置（i5-12600K + 16GB RAM + RTX 2060 6G），显存（6GB）是主要瓶颈。为了在保证流畅运行的同时实现“把流程跑通”，我们需要选择轻量级但能力够用的模型。

## 1. 硬件评估与模型选择方案

| 组件 | 您的配置 | 评估结论 |
| :--- | :--- | :--- |
| **CPU** | i5-12600K | **非常强劲**。在显存不足时，部分计算可以卸载到 CPU，虽然慢点但能跑。 |
| **内存** | 16GB | **够用**。运行 Dify 和 Docker 没问题，但要留给模型 8-10G，略显紧凑。 |
| **显卡** | RTX 2060 (6GB) | **瓶颈所在**。无法运行 72B 甚至 14B 的全量模型。 |

### 💡 推荐模型方案 (量化版)
*   **LLM (聊天模型)**: **Qwen 2.5-7B-Instruct-q4_k_m** (4bit 量化版)
    *   *显存占用*: 约 4.5GB。
    *   *剩余显存*: 约 1.5GB (留给系统显示和 Rerank 模型)。
    *   *性能*: 中文能力优秀，7B 参数量是目前 6G 显卡的最佳平衡点。
*   **Embedding (向量模型)**: **bge-m3** (轻量级)
*   **Rerank (重排模型)**: **bge-reranker-base** (轻量级，显存占用 < 500MB)

---

## 2. 详细安装步骤 (Windows 11)

### 第一步：环境准备 (Docker & WSL2)
Dify 必须运行在 Docker 中，而 Docker 在 Windows 上依赖 WSL2。

1.  **开启 WSL2**:
    *   右键“开始”菜单 -> **终端 (管理员)**。
    *   输入命令：`wsl --install`。
    *   重启电脑。
2.  **安装 Docker Desktop**:
    *   下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)。
    *   安装完成后启动，设置 -> Resources -> WSL Integration -> 勾选你的 Linux 发行版 (如 Ubuntu)。

### 第二步：安装推理引擎 (Ollama - 最适合 Windows)
Ollama 对 Windows 支持极好，且资源占用低，适合小显存机器。

1.  **下载 Ollama**:
    *   访问 [Ollama 官网](https://ollama.com/download/windows) 下载 Windows 版并安装。
2.  **验证安装**:
    *   打开终端 (PowerShell)，输入 `ollama --version`。
3.  **下载并运行模型**:
    *   在终端依次运行以下命令 (会自动下载模型文件)：
    ```powershell
    # 1. 下载主模型 (通义千问 2.5 - 7B)
    ollama pull qwen2.5:7b

    # 2. 下载向量模型 (用于知识库检索)
    ollama pull nomic-embed-text
    ```
4.  **配置 Ollama 允许局域网访问** (关键步骤!):
    *   在任务栏右下角找到 Ollama 图标 -> Quit Ollama (退出)。
    *   搜索“环境变量” -> 编辑系统环境变量。
    *   新建系统变量：
        *   变量名: `OLLAMA_HOST`
        *   变量值: `0.0.0.0:11434`
    *   重新启动 Ollama。

### 第三步：部署 Dify (大脑)

1.  **下载 Dify 源码**:
    *   找一个文件夹 (例如 `D:\AI`)，右键 -> 在终端中打开。
    *   输入: `git clone https://github.com/langgenius/dify.git`
    *   (如果没有 git，可以直接去 GitHub 下载 ZIP 包解压)。
2.  **启动 Dify**:
    ```powershell
    cd dify/docker
    cp .env.example .env
    docker compose up -d
    ```
    *   *注意*: 第一次启动会下载很多镜像，可能需要 10-30 分钟。
3.  **访问 Dify**:
    *   浏览器打开 `http://localhost/install`。
    *   注册管理员账号。

### 第四步：Dify 对接本地模型 (联调)

1.  **获取本机 IP**:
    *   终端输入 `ipconfig`，找到 IPv4 地址 (例如 `192.168.1.5`)。
    *   *注意*: 在 Docker 容器里访问宿主机，不能用 `localhost`，要用 `host.docker.internal` 或者局域网 IP。
2.  **配置模型供应商**:
    *   Dify 后台 -> 设置 -> 模型供应商 -> **Ollama**。
    *   **Model Name**: `qwen2.5:7b`
    *   **Base URL**: `http://192.168.1.5:11434` (把 IP 换成你查到的那个)。
    *   点击“保存”。同理添加 `nomic-embed-text` 作为 Text Embedding 模型。

---

## 3. 验证与跑通

1.  **创建应用**: Dify 首页 -> 创建空白应用 -> 聊天助手。
2.  **选择模型**: 右上角选择 `qwen2.5:7b`。
3.  **上传知识库**:
    *   点击“知识库” -> 创建知识库 -> 上传一个简单的 Word 文档。
    *   索引模式选择“高质量”，Embedding 模型选 `nomic-embed-text`。
4.  **提问测试**:
    *   回到聊天界面，开启“引用和归属”，问一个文档里的问题。
    *   如果能回答且带有引用，说明**全流程跑通**！

## 4. 进阶：如何减少幻觉？(针对 6G 显存的妥协方案)

由于 6G 显存无法运行强大的 Rerank 模型，我们只能采取**“以量换质”**策略：

1.  **提示词工程 (Prompt Engineering)**:
    *   在 Dify 的系统提示词里强制约束：`"你是一个严谨的助手。请仅根据下方的【背景信息】回答问题。如果背景信息中没有答案，请直接说不知道，严禁编造。"`
2.  **调整检索参数**:
    *   在知识库设置中，将“Top K”设置为 3 (只给模型看最相关的 3 段)，避免信息过载导致 7B 模型处理不过来。
3.  **升级建议**:
    *   如果确实需要更强的防幻觉能力，建议将显卡升级到 12G 显存 (如 RTX 3060 12G 或 4070)，这样就能跑 `bge-reranker-large` 模型了。

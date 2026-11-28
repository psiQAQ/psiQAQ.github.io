# Claude project launcher for macOS zsh
cc() {
    # Mac 用户建议将项目根目录设置为 ~/cc-workspace
    # 不建议放在 ~/Desktop、~/Documents、~/Downloads 或 iCloud Drive 下；
    # 这些目录受 macOS 隐私权限/TCC 机制影响，Claude Code/Claude Desktop 的本地文件访问、preview、hooks/git 子进程更容易遇到权限问题。
    local base="$HOME/cc-workspace"

    local choice project_name settings_file settings_choice
    local sf label d
    local -a settings_files
    local -a dirs

    # 确保 Claude 配置目录存在
    mkdir -p "$HOME/.claude" || return 1

    # 自动检测 Claude settings 文件：settings.json / settings-xxx.json
    while IFS= read -r sf; do
        settings_files+=("$(basename "$sf")")
    done < <(find "$HOME/.claude" -maxdepth 1 -name 'settings*.json' -type f 2>/dev/null | sort)

    # 选择 settings 文件
    if (( ${#settings_files[@]} == 0 )); then
        settings_file="$HOME/.claude/settings.json"

    elif (( ${#settings_files[@]} == 1 )); then
        # zsh 数组默认从 1 开始
        settings_file="$HOME/.claude/${settings_files[1]}"

    else
        echo "Select settings file (0=default, Enter=default):"

        local si=1
        for sf in "${settings_files[@]}"; do
            label="${sf#settings}"
            label="${label%.json}"
            label="${label#-}"
            [[ -z "$label" ]] && label="(default)"
            echo "  $si) $sf  $label"
            ((si++))
        done

        while true; do
            printf "Choice: "
            IFS= read -r settings_choice

            if [[ -z "$settings_choice" || "$settings_choice" == "0" ]]; then
                settings_file="$HOME/.claude/settings.json"
                break

            elif [[ "$settings_choice" =~ '^[0-9]+$' ]] && (( settings_choice >= 1 && settings_choice <= ${#settings_files[@]} )); then
                # zsh 数组直接使用 1-based 编号
                settings_file="$HOME/.claude/${settings_files[$settings_choice]}"
                break

            else
                echo "Invalid choice. Enter 0-${#settings_files[@]} or press Enter for default."
            fi
        done
    fi

    # 防止 settings_file 为空
    if [[ -z "$settings_file" ]]; then
        echo "Error: settings_file is empty."
        return 1
    fi

    # 防止 --settings 指向目录
    if [[ -d "$settings_file" ]]; then
        echo "Error: --settings points to a directory: $settings_file"
        echo "Expected a JSON file, for example: $HOME/.claude/settings.json"
        return 1
    fi

    # 如果 settings 文件不存在，则创建空 JSON
    [[ -f "$settings_file" ]] || echo "{}" > "$settings_file"

    # 确保 workspace 存在
    mkdir -p "$base" || return 1
    cd "$base" || return 1

    # 读取 workspace 下第一层项目目录
    while IFS= read -r d; do
        dirs+=("$(basename "$d")")
    done < <(find "$base" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)

    echo "0) <create new project>"

    local i=1
    for d in "${dirs[@]}"; do
        echo "$i) $d"
        ((i++))
    done

    # 选择或创建项目
    while true; do
        printf "Select project number: "
        IFS= read -r choice

        if [[ "$choice" =~ '^[0-9]+$' ]]; then
            if (( choice == 0 )); then
                while true; do
                    printf "New project name: "
                    IFS= read -r project_name

                    if [[ "$project_name" =~ '^[A-Za-z0-9_-][A-Za-z0-9._-]*$' ]]; then
                        mkdir -p "$base/$project_name" || return 1
                        cd "$base/$project_name" || return 1
                        break
                    else
                        echo "Invalid name. Use letters, numbers, dot, underscore, or hyphen; do not start with dot."
                    fi
                done
                break

            elif (( choice >= 1 && choice <= ${#dirs[@]} )); then
                # zsh 数组直接使用 1-based 编号
                cd "$base/${dirs[$choice]}" || return 1
                break

            else
                echo "Invalid number."
            fi
        else
            echo "Please enter a number."
        fi
    done

    # 显示当前使用的项目和 settings，方便排错
    echo "Project: $(pwd)"
    echo "Settings: $settings_file"

    # 启动 Claude Code
    claude --settings "$settings_file" "$@"
}
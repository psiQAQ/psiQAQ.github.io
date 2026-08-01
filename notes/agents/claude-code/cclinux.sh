# Claude project launcher
cc() {
    # Linux/WSL 推荐在根目录下创建 workspace 文件夹
    local base="$HOME/workspace"

    local choice project_name settings_file settings_choice
    local settings_files=()
    local dirs=()

    # 自动检测 Claude settings 文件：兼容 macOS BSD find 和 Linux GNU find
    while IFS= read -r sf; do
        settings_files+=("$(basename "$sf")")
    done < <(find "$HOME/.claude" -maxdepth 1 -name 'settings*.json' -type f 2>/dev/null | sort)

    if (( ${#settings_files[@]} == 1 )); then
        settings_file="$HOME/.claude/${settings_files[0]}"
    else
        echo "Select settings file (0=default, Enter=default):"

        local si=1 sf label
        for sf in "${settings_files[@]}"; do
            label="${sf#settings}"
            label="${label%.json}"
            label="${label#-}"
            [[ -z "$label" ]] && label="(default)"
            echo "  $si) $sf  $label"
            ((si++))
        done

        while true; do
            read -r -p "Choice: " settings_choice

            if [[ -z "$settings_choice" || "$settings_choice" == "0" ]]; then
                settings_file="$HOME/.claude/settings.json"
                break
            elif [[ "$settings_choice" =~ ^[0-9]+$ ]] && (( settings_choice >= 1 && settings_choice <= ${#settings_files[@]} )); then
                settings_file="$HOME/.claude/${settings_files[$((settings_choice-1))]}"
                break
            else
                echo "Invalid choice. Enter 0-${#settings_files[@]} or press Enter for default."
            fi
        done
    fi

    # 如果默认 settings.json 不存在，则自动创建
    mkdir -p "$HOME/.claude" || return 1
    [[ -f "$settings_file" ]] || echo "{}" > "$settings_file"

    # 确保 workspace 存在
    mkdir -p "$base" || return 1
    cd "$base" || return 1

    # 读取 workspace 下第一层文件夹：兼容 macOS/Linux
    while IFS= read -r d; do
        dirs+=("$(basename "$d")")
    done < <(find "$base" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)

    echo "0) <create new project>"

    local i=1 d
    for d in "${dirs[@]}"; do
        echo "$i) $d"
        ((i++))
    done

    while true; do
        read -r -p "Select project number: " choice

        if [[ "$choice" =~ ^[0-9]+$ ]]; then
            if (( choice == 0 )); then
                while true; do
                    read -r -p "New project name: " project_name

                    if [[ "$project_name" =~ ^[A-Za-z0-9_-][A-Za-z0-9._-]*$ ]]; then
                        mkdir -p "$base/$project_name" || return 1
                        cd "$base/$project_name" || return 1
                        break
                    else
                        echo "Invalid name. Use letters, numbers, dot, underscore, or hyphen; do not start with dot."
                    fi
                done
                break

            elif (( choice >= 1 && choice <= ${#dirs[@]} )); then
                cd "$base/${dirs[$((choice-1))]}" || return 1
                break
            else
                echo "Invalid number."
            fi
        else
            echo "Please enter a number."
        fi
    done

    claude --settings "$settings_file" "$@"
}
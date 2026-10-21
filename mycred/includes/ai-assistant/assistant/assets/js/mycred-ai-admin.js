/**
 * myCred AI Assistant Admin Javascript
 *
 * Handles chat communication, message rendering, typing indicator,
 * starter chips, and composer popover.
 *
 * Future enhancements (require API payload changes):
 * - Tool status rows ("Checked point circulation")
 * - Confirm cards for write actions
 * - Follow-up suggestion chips under assistant replies
 *
 * @package myCred
 * @subpackage AI
 * @since 1.0.0
 */

document.addEventListener('DOMContentLoaded', function () {
    const chatMessages = document.getElementById('mycred-ai-chat-messages');
    const chatForm = document.getElementById('mycred-ai-chat-form');
    const chatInput = document.getElementById('mycred-ai-chat-input');
    const sendBtn = document.getElementById('mycred-ai-send-btn');
    const shell = document.getElementById('mycred-ai-shell');
    const newChatBtn = document.getElementById('mycred-ai-new-chat');
    const canBtn = document.getElementById('mycred-ai-what-i-can-btn');
    const canPanel = document.getElementById('mycred-ai-what-i-can-panel');

    if (!chatMessages || !chatForm || !chatInput || !sendBtn) {
        return;
    }

    let conversationHistory = [];
    const quotaText = document.getElementById('mycred-ai-quota-text');

    function quotaString(key, fallback) {
        return (window.mycredAi && mycredAi.strings && mycredAi.strings[key]) ? mycredAi.strings[key] : fallback;
    }

    function formatQuotaNumber(value) {
        const n = parseInt(value, 10) || 0;
        try {
            return n.toLocaleString();
        } catch (e) {
            return String(n);
        }
    }

    function paintQuota(quota) {
        if (!quotaText || !quota || typeof quota !== 'object') {
            return;
        }
        const used = formatQuotaNumber(quota.used);
        const total = formatQuotaNumber(quota.total);
        const template = quota.type === 'credits'
            ? quotaString('creditsLine', 'AI Credits: %1$s / %2$s')
            : quotaString('tokensLine', 'AI Tokens: %1$s / %2$s');
        quotaText.textContent = template.replace('%1$s', used).replace('%2$s', total);
    }

    if (window.mycredAi && mycredAi.quota) {
        paintQuota(mycredAi.quota);
    }

    function setMode(mode) {
        if (!shell) {
            return;
        }
        shell.setAttribute('data-mode', mode);
    }

    function updateSendButtonState() {
        sendBtn.disabled = chatInput.disabled || chatInput.value.trim() === '';
    }

    function setCanOpen(open) {
        if (!canBtn || !canPanel) {
            return;
        }
        canBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        canPanel.classList.toggle('is-open', open);
        if (shell) {
            shell.classList.toggle('is-can-open', open);
        }
        if (open) {
            canPanel.removeAttribute('hidden');
        } else {
            canPanel.setAttribute('hidden', '');
        }
    }

    function enterThread() {
        setCanOpen(false);
        setMode('thread');
    }

    function resetChat() {
        conversationHistory = [];
        chatMessages.innerHTML = '';
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.disabled = false;
        setCanOpen(false);
        setMode('empty');
        updateSendButtonState();
        chatInput.focus();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight - 16) + 'px';
        this.style.overflow = 'hidden';
        updateSendButtonState();
    });

    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    function formatMessageContent(text) {
        if (!text) return '';

        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
        escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        escaped = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

        const lines = escaped.split('\n');
        let inList = false;
        let inTable = false;
        let formatted = '';

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line === '') {
                if (inList) { formatted += '</ul>'; inList = false; }
                if (inTable) { formatted += '</tbody></table></div>'; inTable = false; }
                formatted += '<br>';
                continue;
            }

            if (line.startsWith('|') && line.endsWith('|')) {
                if (inList) { formatted += '</ul>'; inList = false; }

                if (line.match(/^\|[\s\-\:]+\|.*\|$/)) {
                    continue;
                }

                if (!inTable) {
                    inTable = true;
                    formatted += '<div class="mycred-ai-table-wrapper"><table class="mycred-ai-table">';
                    let cells = line.split('|').slice(1, -1);
                    formatted += '<thead><tr>';
                    cells.forEach(cell => formatted += `<th>${cell.trim()}</th>`);
                    formatted += '</tr></thead><tbody>';
                } else {
                    let cells = line.split('|').slice(1, -1);
                    formatted += '<tr>';
                    cells.forEach(cell => formatted += `<td>${cell.trim()}</td>`);
                    formatted += '</tr>';
                }
                continue;
            } else {
                if (inTable) { formatted += '</tbody></table></div>'; inTable = false; }
            }

            const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
            if (headingMatch) {
                if (inList) { formatted += '</ul>'; inList = false; }
                if (inTable) { formatted += '</tbody></table></div>'; inTable = false; }
                const level = headingMatch[1].length;
                formatted += '<p class="mycred-ai-md-heading mycred-ai-md-heading--' + level + '">' + headingMatch[2] + '</p>';
                continue;
            }

            if (line.startsWith('- ') || line.startsWith('* ')) {
                if (!inList) {
                    formatted += '<ul>';
                    inList = true;
                }
                formatted += '<li>' + line.substring(2) + '</li>';
                continue;
            } else {
                if (inList) { formatted += '</ul>'; inList = false; }
            }

            formatted += line + '<br>';
        }

        if (inList) formatted += '</ul>';
        if (inTable) formatted += '</tbody></table></div>';

        escaped = formatted.replace(/(<br>)+$/, '');
        return escaped;
    }

    function createAssistantAvatar() {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'mycred-ai-msg-avatar';
        if (mycredAi && mycredAi.avatar_url) {
            avatarDiv.innerHTML = `<img src="${mycredAi.avatar_url}" alt="" width="28" height="28" decoding="async" />`;
        } else {
            avatarDiv.textContent = 'AI';
        }
        return avatarDiv;
    }

    function appendMessage(role, text, isHtml = false) {
        if (role === 'user') {
            const userMsg = document.createElement('p');
            userMsg.className = 'mycred-ai-msg-user';
            userMsg.textContent = text;
            chatMessages.appendChild(userMsg);
            scrollToBottom();
            return userMsg;
        }

        const messageRow = document.createElement('div');
        messageRow.className = 'mycred-ai-msg-ai';

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'mycred-ai-msg-body';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (isHtml) {
            contentDiv.innerHTML = text;
        } else {
            contentDiv.innerHTML = formatMessageContent(text);
        }

        bodyDiv.appendChild(contentDiv);
        messageRow.appendChild(createAssistantAvatar());
        messageRow.appendChild(bodyDiv);
        chatMessages.appendChild(messageRow);

        scrollToBottom();
        return messageRow;
    }

    function showTypingIndicator() {
        const messageRow = document.createElement('div');
        messageRow.className = 'mycred-ai-msg-ai typing-placeholder';

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'mycred-ai-msg-body';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content mycred-ai-typing-content';

        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'mycred-ai-typing-indicator';
        indicatorDiv.innerHTML = '<span></span><span></span><span></span>';

        contentDiv.appendChild(indicatorDiv);
        bodyDiv.appendChild(contentDiv);
        messageRow.appendChild(createAssistantAvatar());
        messageRow.appendChild(bodyDiv);
        chatMessages.appendChild(messageRow);

        scrollToBottom();
        return messageRow;
    }

    function sendMessage(messageText) {
        if (!messageText || messageText.trim() === '') {
            return;
        }

        enterThread();

        appendMessage('user', messageText);
        conversationHistory.push({
            role: 'user',
            parts: [{
                channel: 'content',
                type: 'text',
                text: messageText
            }]
        });

        chatInput.value = '';
        chatInput.style.height = 'auto';
        updateSendButtonState();

        chatInput.disabled = true;
        sendBtn.disabled = true;

        const typingIndicator = showTypingIndicator();

        jQuery.ajax({
            url: mycredAi.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'mycred_ai_chat',
                nonce: mycredAi.nonce,
                message: messageText,
                history: conversationHistory.slice(0, -1)
            },
            success: function (response) {
                if (typingIndicator) {
                    typingIndicator.remove();
                }

                chatInput.disabled = false;
                updateSendButtonState();
                chatInput.focus();

                if (response.success) {
                    appendMessage('assistant', response.data.reply);

                    if (response.data.history) {
                        conversationHistory = response.data.history;
                    }
                    if (response.data && response.data.quota) {
                        paintQuota(response.data.quota);
                    }
                } else {
                    const errMsg = response.data && response.data.message ? response.data.message : mycredAi.strings.error;
                    const isHtml = !!(response.data && response.data.is_html);
                    appendMessage('assistant', errMsg, isHtml);
                    if (response.data && response.data.quota) {
                        paintQuota(response.data.quota);
                    }
                }
            },
            error: function () {
                if (typingIndicator) {
                    typingIndicator.remove();
                }

                chatInput.disabled = false;
                updateSendButtonState();

                appendMessage('assistant', mycredAi.strings.error);
            }
        });
    }

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (sendBtn.disabled) {
            return;
        }
        sendMessage(text);
    });

    function fillComposer(text) {
        if (!text) {
            return;
        }
        chatInput.value = text;
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight - 16) + 'px';
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        chatInput.focus();
    }

    document.addEventListener('click', function (e) {
        const chip = e.target && e.target.closest ? e.target.closest('.mycred-ai-chip, .mycred-ai-prompt-card') : null;
        if (chip) {
            e.preventDefault();
            const prompt = chip.getAttribute('data-prompt') || chip.textContent.replace(/"/g, '');
            fillComposer(prompt.trim());
        }
    });

    if (canBtn && canPanel) {
        canBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            setCanOpen(canBtn.getAttribute('aria-expanded') !== 'true');
        });
        document.addEventListener('click', function (e) {
            if (chatForm && !chatForm.contains(e.target)) {
                setCanOpen(false);
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                setCanOpen(false);
            }
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', function () {
            resetChat();
        });
    }

    updateSendButtonState();
    chatInput.focus();
});

// ==UserScript==
// @name         CSFeedback Auto Survey
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  一键开始自动填写问卷，支持停止与自动结束
// @author       gakiyukr
// @match        *://*.csfeedback.net/*
// @updateURL    https://cdn.jsdelivr.net/gh/gakiyukr/csfeedback-auto@main/auto.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/gakiyukr/csfeedback-auto@main/auto.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let running = localStorage.getItem("cs_auto_running") === "true";

    function setRunning(val) {
        running = val;
        localStorage.setItem("cs_auto_running", val ? "true" : "false");
    }

    function getProgress() {
        let text = document.body.innerText;
        let match = text.match(/(\d+)%/);
        return match ? parseInt(match[1], 10) : 0;
    }

    function answerRadio() {
        let radios = document.querySelectorAll('input[type="radio"]');
        let groups = {};

        radios.forEach(r => {
            if (!groups[r.name]) groups[r.name] = [];
            groups[r.name].push(r);
        });

        Object.values(groups).forEach(group => {
            let choice = group[Math.floor(Math.random() * group.length)];
            choice.click();
        });
    }

    function answerCheckbox() {
        let checkboxes = document.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length === 0) return;

        let groups = {};

        checkboxes.forEach(cb => {
            let name = cb.name.replace(/\[\]$/, '');
            if (!groups[name]) groups[name] = [];
            groups[name].push(cb);
        });

        Object.values(groups).forEach(group => {
            let count = Math.max(1, Math.floor(Math.random() * group.length));
            let shuffled = [...group].sort(() => 0.5 - Math.random());

            shuffled.slice(0, count).forEach(cb => {
                let label = document.querySelector(`label[for="${cb.id}"]`);
                if (label) {
                    label.click();
                } else {
                    cb.click();
                }
            });
        });
    }

    function submitForm() {
        if (document.forms.length > 0) {
            document.forms[0].submit();
        }
    }

    function run() {
        if (!running) return;

        let progress = getProgress();
        console.log("当前进度:", progress);

        if (progress >= 100) {
            console.log("已完成，自动停止");
            setRunning(false);
            updateButton();
            return;
        }

        let hasRadio = document.querySelectorAll('input[type="radio"]').length > 0;
        let hasCheckbox = document.querySelectorAll('input[type="checkbox"]').length > 0;

        if (hasRadio) answerRadio();
        if (hasCheckbox) answerCheckbox();

        setTimeout(submitForm, 1200);
    }

    let btn;

    function updateButton() {
        if (!btn) return;
        btn.innerText = running ? "⏹ 停止自动填写" : "🚀 开始自动填写";
        btn.style.background = running ? "#f44336" : "#00bcd4";
    }

    function createButton() {
        btn = document.createElement("button");
        btn.style.position = "fixed";
        btn.style.bottom = "20px";
        btn.style.right = "20px";
        btn.style.zIndex = "9999";
        btn.style.padding = "10px 15px";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "8px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "14px";
        btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

        btn.onclick = function () {
            setRunning(!running);
            updateButton();

            if (running) {
                run();
            }
        };

        updateButton();
        document.body.appendChild(btn);
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            createButton();

            if (running) {
                run();
            }
        }, 1000);
    });

})();

<div align="center">

# 📅 streamlit-gantt

**An interactive Gantt chart component for Streamlit — drag, resize, link, and track project timelines in pure Python**

<a href="https://pypi.org/project/streamlit-gantt/"><img src="https://img.shields.io/pypi/v/streamlit-gantt.svg?style=flat-square&color=818cf8" alt="PyPI version" /></a>
<a href="https://pypi.org/project/streamlit-gantt/"><img src="https://img.shields.io/pypi/pyversions/streamlit-gantt.svg?style=flat-square" alt="Python versions" /></a>
<a href="https://pypi.org/project/streamlit-gantt/"><img src="https://img.shields.io/pypi/dm/streamlit-gantt.svg?style=flat-square&color=34d399" alt="Downloads" /></a>
<img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />

</div>

---

`streamlit-gantt` is a fully interactive Gantt chart that runs inside any Streamlit app. Drag to move tasks, resize bars, draw dependency arrows, track progress, and get the complete state back in Python — no external dependencies required.

## ✨ Features

- **Task management** — add, delete, and edit tasks inline
- **Drag-to-move & resize** — reposition and stretch task bars on the timeline
- **Dependency arrows** — smooth Bézier curves connect dependent tasks
- **Progress tracking** — per-task progress bars (0–100%)
- **Auto-coloring** — 8-color rotating palette
- **Today line** — dashed red marker on the current date
- **Weekend highlighting** — Saturday/Sunday columns are subtly tinted
- **Month labels** — calendar context always visible above the day grid

## 🚀 Quick Start

```bash
pip install streamlit-gantt
```

```python
import streamlit as st
from streamlit_gantt import gantt

result = gantt(tasks=[
    {"id": "1", "name": "Design", "start": "2024-01-01", "end": "2024-01-07"},
    {"id": "2", "name": "Build",  "start": "2024-01-08", "end": "2024-01-21", "deps": ["1"]},
])
st.write(result)
```

## 🛠️ Tech Stack

- **React + TypeScript** — frontend component
- **Python / Streamlit** — backend integration
- **SVG** — dependency arrows and timeline rendering
- **PyPI** — distributed as `streamlit-gantt`

## 🤝 Contributing

PRs welcome. Open an issue first for major changes.

## 📄 License

MIT

## 💛 Support

If streamlit-gantt helps your project management workflow, consider supporting development:

👉 [Donate via PayPal](https://paypal.me/noodlebake) — @noodlebake

---
<div align="center">Made with ❤️ by <a href="https://github.com/RhythrosaLabs">RhythrosaLabs</a></div>

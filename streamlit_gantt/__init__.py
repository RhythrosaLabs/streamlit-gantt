import os
import streamlit.components.v1 as components

_RELEASE = True

if _RELEASE:
    _component_func = components.declare_component(
        "streamlit_gantt",
        path=os.path.join(os.path.dirname(__file__), "frontend/build"),
    )
else:
    _component_func = components.declare_component(
        "streamlit_gantt",
        url="http://localhost:3005",
    )


def st_gantt(tasks=None, height=500, key=None):
    """
    Render an interactive Gantt chart.

    Parameters
    ----------
    tasks : list[dict], optional
        List of task objects. Each has id, name, start (day offset),
        duration (days), progress (0-100), color, dependencies (list of ids).
    height : int
        Component height in pixels.
    key : str, optional
        Streamlit widget key for state isolation.

    Returns
    -------
    dict | None
        Updated task list after user interaction.
    """
    return _component_func(tasks=tasks, height=height, key=key, default=None)

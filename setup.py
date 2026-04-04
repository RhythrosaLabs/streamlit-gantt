from setuptools import setup, find_packages

setup(
    name="streamlit-gantt",
    version="0.1.0",
    author="Dan Sheils",
    author_email="",
    description="Interactive Gantt chart component for Streamlit with drag-and-drop task scheduling",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/RhythrosaLabs/streamlit-gantt",
    project_urls={
        "Bug Tracker": "https://github.com/RhythrosaLabs/streamlit-gantt/issues",
        "Changelog": "https://github.com/RhythrosaLabs/streamlit-gantt/blob/main/CHANGELOG.md",
    },
    packages=find_packages(),
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=["streamlit>=1.28.0"],
)

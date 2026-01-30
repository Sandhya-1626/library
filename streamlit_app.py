import streamlit as st
import requests
import pandas as pd
import json

# Set page configuration
st.set_page_config(page_title="Smart Library Admin", layout="wide")

# API Base URL
API_URL = "http://127.0.0.1:5000/api"

def login_admin(username, password):
    try:
        response = requests.post(f"{API_URL}/login/admin", json={"username": username.strip(), "password": password.strip()})
        if response.status_code == 200:
            return response.json()
        else:
            try:
                return response.json()
            except:
                return {"success": False, "message": f"Server Error: {response.status_code}"}
    except requests.exceptions.ConnectionError:
        return {"success": False, "message": "Cannot connect to server. Is 'node server.js' running at 127.0.0.1:5000?"}

def fetch_data(endpoint):
    try:
        response = requests.get(f"{API_URL}/{endpoint}")
        if response.status_code == 200:
            return response.json()
        return []
    except:
        return []

# Session State for Login
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'user' not in st.session_state:
    st.session_state.user = None

# Styles
st.markdown("""
    <style>
    .main {
        background-color: #f0f2f6;
    }
    .stButton>button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

# Main App Logic
def main():
    st.title("📚 Smart Digital Library - Admin Portal")

    # Health check sidebar
    try:
        health = requests.get(f"http://127.0.0.1:5000/api/books", timeout=1)
        if health.status_code == 200:
            st.sidebar.success("✅ Backend Connected")
        else:
            st.sidebar.error(f"⚠️ Backend Error: {health.status_code}")
    except:
        st.sidebar.error("❌ Backend Offline")

    if not st.session_state.logged_in:
        st.header("Admin Login")
        
        col1, col2, col3 = st.columns([1,1,1])
        with col2:
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            
            if st.button("Login"):
                if username and password:
                    result = login_admin(username, password)
                    if result.get("success"):
                        st.session_state.logged_in = True
                        st.session_state.user = result.get("user")
                        st.success(result.get("message"))
                        st.rerun()
                    else:
                        st.error(result.get("message"))
                else:
                    st.warning("Please enter both username and password")
            
            st.info("Default Admin: admin / admin123")

    else:
        # Admin Dashboard
        st.sidebar.title(f"Welcome, {st.session_state.user.get('username')}")
        if st.sidebar.button("Logout"):
            st.session_state.logged_in = False
            st.session_state.user = None
            st.rerun()
        
        tab1, tab2, tab3, tab4 = st.tabs(["Dashboard Stats", "Users", "Activity Logs", "Book Views"])

        with tab1:
            st.subheader("Overview")
            try:
                stats = fetch_data("admin/stats")
                if stats:
                    col1, col2 = st.columns(2)
                    col1.metric("Total Logins Today", stats.get("totalLogins", 0))
                    
                    st.write("Department-wise Logins:")
                    dept_data = stats.get("deptWiseLogins", {})
                    if dept_data:
                        st.bar_chart(dept_data)
                    else:
                        st.info("No login data for today yet.")
                else:
                    st.warning("Could not fetch stats")
            except Exception as e:
                st.error(f"Error loading stats: {e}")

        with tab2:
            st.subheader("Registered Users")
            users = fetch_data("admin/users")
            if users:
                df = pd.DataFrame(users)
                st.dataframe(df, use_container_width=True)
            else:
                st.info("No users found.")

        with tab3:
            st.subheader("Access Logs")
            logs = fetch_data("admin/logs")
            if logs:
                df = pd.DataFrame(logs)
                st.dataframe(df, use_container_width=True)
            else:
                st.info("No logs found.")

        with tab4:
            st.subheader("Book View History")
            views = fetch_data("admin/book-views")
            if views:
                df = pd.DataFrame(views)
                st.dataframe(df, use_container_width=True)
            else:
                st.info("No book views recorded.")

if __name__ == "__main__":
    main()

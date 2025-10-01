import streamlit as st 
from helper import get_foods

st.set_page_config(page_title="Foods", page_icon=":apple:", layout="wide")  
st.header('Foods')

tab1, tab2 = st.tabs(['List', 'Form'])

with tab1:
  res = get_foods()  
  st.table(res)
  # st.data_editor(res)

with tab2:
  st.write('Form')
import streamlit as st  
from helper import get_phrases

st.set_page_config(page_title="Hello", page_icon=":tada:", layout="wide")
search = st.text_input('', placeholder="Portuguese, English and Tags")
st.button('Search')


for row in get_phrases(search=search):
  tags = ''
  for tag in row['tags']:
    tags += f'`{tag}` '
  
  st.markdown(f'''
    ###### {row["english"]}     
    {row["portuguese"]}
    
    {tags}
  ''')
  
  st.audio(row['audio'])
  st.markdown('---')

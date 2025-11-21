#!/bin/bash
# Script para criar ícones placeholder simples

echo "Criando ícones placeholder..."

# Cria um ícone simples usando base64 (será substituído por ícones reais)
# Como não temos ImageMagick ou outras ferramentas gráficas,
# vamos criar arquivos mínimos que o Chrome aceita

# Ícone PNG 16x16 (mínimo válido - quadrado roxo)
base64 -d > icon16.png << 'ICON16'
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABJSURB
VDiNY2AYBaNgFIwCmgETAwHw//9/ZgYkwMTExIAAGBkZGZBFkA0YBaNgFIyCUTAKRsEoGAWjYBSM
glEwCkbBKBgFQxkAAE8VBAYaHP/FAAAAAElFTkSuQmCC
ICON16

# Copia para os outros tamanhos (placeholder - idealmente seriam diferentes)
cp icon16.png icon48.png
cp icon16.png icon128.png

echo "Ícones placeholder criados!"
echo "IMPORTANTE: Substitua por ícones PNG reais para melhor aparência"

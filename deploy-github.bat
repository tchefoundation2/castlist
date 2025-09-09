@echo off
echo ===== Script de Deploy para GitHub =====

echo Verificando status do Git...
git status

echo.
echo Adicionando arquivos modificados...
git add .

echo.
set /p COMMIT_MSG=Digite a mensagem de commit: 

echo.
echo Realizando commit com a mensagem: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

echo.
echo Enviando para o GitHub...
git push origin castlist-refatoracao

echo.
echo ===== Deploy para GitHub concluído! =====
pause
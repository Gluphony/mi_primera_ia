import sqlite3
import bcrypt

# --- CONFIGURACIÓN ---
correo_admin = "chris1@gmail.com"  # Pon aquí tu correo maestro exacto
nueva_contrasena = "Admin12345"    # Escribe la nueva contraseña que quieras

print("Generando nueva llave encriptada...")
# 1. Encriptar la nueva contraseña con bcrypt
salt = bcrypt.gensalt()
hashed_pw = bcrypt.hashpw(nueva_contrasena.encode('utf-8'), salt).decode('utf-8')

# 2. Conectar a la base de datos SQLite
try:
    conexion = sqlite3.connect("usuarios.db")
    cursor = conexion.cursor()

    # 3. Buscar al usuario y actualizarle la contraseña
    cursor.execute("UPDATE usuarios SET password_hash = ? WHERE email = ?", (hashed_pw, correo_admin))
    conexion.commit()

    if cursor.rowcount > 0:
        print(f"✅ ¡Éxito broder! La contraseña de {correo_admin} ha sido cambiada a: {nueva_contrasena}")
    else:
        print(f"❌ ¡Pipi! No se encontró el correo {correo_admin} en la base de datos. Verifica si lo escribiste bien.")

    conexion.close()
except Exception as e:
    print(f"Ocurrió un error: {e}")
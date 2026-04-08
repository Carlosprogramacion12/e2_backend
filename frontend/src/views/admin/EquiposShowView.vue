<template>
  <AppLayout>
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
      "
    >
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 700">Gestión de Equipo</h2>
      </div>
      <div style="display: flex; gap: 0.75rem">
        <router-link
          :to="'/admin/equipos/' + route.params.id + '/editar'"
          class="btn"
          style="
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid var(--border, #e5e7eb);
            border-radius: 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: #4b5563;
            text-transform: uppercase;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            text-decoration: none;
          "
        >
          <svg
            style="width: 1rem; height: 1rem; margin-right: 0.5rem"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
          Renombrar
        </router-link>
        <router-link
          to="/admin/equipos"
          class="btn btn-indigo"
          style="
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            text-decoration: none;
          "
        >
          <svg
            style="width: 1rem; height: 1rem; margin-right: 0.5rem"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Volver
        </router-link>
      </div>
    </div>

    <div v-if="loading" style="padding: 4rem; text-align: center">
      <div class="spinner"></div>
    </div>

    <div
      v-else
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem"
    >
      <!-- Módulo Izquierdo: Buscador Inteligente -->
      <div style="grid-column: span 1">
        <div
          style="
            background: var(--card-bg, #fff);
            border-radius: 1rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border, #e5e7eb);
            position: sticky;
            top: 2rem;
          "
        >
          <div
            style="
              padding: 1.5rem;
              border-bottom: 1px solid var(--border, #f3f4f6);
              background: #f9fafb;
              border-top-left-radius: 1rem;
              border-top-right-radius: 1rem;
            "
          >
            <h3
              style="
                font-size: 0.875rem;
                font-weight: 700;
                color: var(--text-primary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 1rem;
              "
            >
              Agregar Miembro
            </h3>

            <!-- Formulario de Confirmación -->
            <div
              v-if="selectedCandidate"
              style="
                margin-bottom: 1rem;
                background: #eff6ff;
                padding: 1rem;
                border-radius: 0.75rem;
                border: 1px solid #bfdbfe;
                position: relative;
              "
            >
              <button
                @click="selectedCandidate = null"
                style="
                  position: absolute;
                  top: 0.75rem;
                  right: 0.75rem;
                  color: #9ca3af;
                  background: none;
                  border: none;
                  cursor: pointer;
                "
              >
                <svg
                  style="width: 1rem; height: 1rem"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <p
                style="
                  font-size: 10px;
                  color: #6366f1;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 0.25rem;
                "
              >
                Candidato Seleccionado
              </p>
              <p
                style="
                  font-size: 0.875rem;
                  font-weight: 700;
                  color: #111827;
                  margin-bottom: 0.5rem;
                "
              >
                {{ selectedCandidate.name }}
              </p>

              <form @submit.prevent="addMember">
                <div style="margin-bottom: 0.75rem">
                  <label
                    style="
                      display: block;
                      font-size: 0.75rem;
                      font-weight: 700;
                      color: #6b7280;
                      margin-bottom: 0.25rem;
                    "
                    >Asignar Rol</label
                  >
                  <select
                    v-model="selectedPerfil"
                    required
                    style="
                      width: 100%;
                      border-radius: 0.5rem;
                      border: 1px solid #d1d5db;
                      padding: 0.5rem;
                      font-size: 0.75rem;
                    "
                  >
                    <option value="">Seleccionar...</option>
                    <option v-for="p in perfiles" :key="p.id" :value="p.id">
                      {{ p.nombre }}
                    </option>
                  </select>
                </div>
                <button
                  type="submit"
                  :disabled="saving"
                  style="
                    width: 100%;
                    padding: 0.5rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                  "
                >
                  Confirmar
                </button>
              </form>
            </div>

            <!-- Buscador -->
            <div style="position: relative">
              <label
                style="
                  display: block;
                  font-size: 0.75rem;
                  font-weight: 700;
                  color: #6b7280;
                  text-transform: uppercase;
                  margin-bottom: 0.5rem;
                "
                >Buscar Alumno</label
              >
              <div style="position: relative">
                <div
                  style="
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    padding-left: 0.75rem;
                    display: flex;
                    align-items: center;
                    color: #9ca3af;
                  "
                >
                  <svg
                    style="width: 1.25rem; height: 1.25rem"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  v-model="search"
                  type="text"
                  placeholder="Nombre o Correo..."
                  style="
                    width: 100%;
                    padding: 0.5rem 1rem 0.5rem 2.25rem;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                  "
                />
              </div>

              <!-- Resultados de búsqueda -->
              <div
                v-if="search.length > 0 && filteredCandidates.length > 0"
                style="
                  position: absolute;
                  z-index: 50;
                  width: 100%;
                  margin-top: 0.5rem;
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 0.75rem;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                  max-height: 15rem;
                  overflow-y: auto;
                "
              >
                <ul style="list-style: none; margin: 0; padding: 0">
                  <li
                    v-for="c in filteredCandidates"
                    :key="c.id"
                    @click="
                      selectedCandidate = c;
                      search = '';
                    "
                    style="
                      padding: 1rem;
                      border-bottom: 1px solid #f3f4f6;
                      cursor: pointer;
                      transition: background 0.2s;
                    "
                    onmouseover="this.style.background = '#f9fafb'"
                    onmouseout="this.style.background = 'white'"
                  >
                    <div
                      style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                      "
                    >
                      <div>
                        <div
                          style="
                            font-size: 0.875rem;
                            font-weight: 700;
                            color: #1f2937;
                          "
                        >
                          {{ c.name }}
                        </div>
                        <div
                          style="
                            font-size: 0.75rem;
                            color: #6b7280;
                            margin-top: 0.125rem;
                          "
                        >
                          {{ c.email }}
                        </div>
                      </div>
                      <span
                        style="
                          font-size: 10px;
                          font-weight: 700;
                          padding: 0.125rem 0.5rem;
                          background: #dcfce7;
                          color: #15803d;
                          border-radius: 0.25rem;
                          border: 1px solid #bbf7d0;
                        "
                        >LIBRE</span
                      >
                    </div>
                  </li>
                </ul>
              </div>
              <div
                v-else-if="search.length > 0 && filteredCandidates.length === 0"
                style="
                  margin-top: 0.5rem;
                  padding: 0.75rem;
                  background: #f9fafb;
                  border-radius: 0.5rem;
                  text-align: center;
                  border: 1px solid #e5e7eb;
                "
              >
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0">
                  No se encontraron alumnos libres.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Módulo Derecho: Miembros y Proyecto -->
      <div
        style="
          grid-column: span 2;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        "
      >
        <!-- Integrantes -->
        <div
          style="
            background: var(--card-bg, #fff);
            border-radius: 1rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border, #e5e7eb);
          "
        >
          <div
            style="
              padding: 1.5rem;
              border-bottom: 1px solid var(--border, #f3f4f6);
              background: #f9fafb;
              border-top-left-radius: 1rem;
              border-top-right-radius: 1rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <h3
              style="
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--text-primary);
              "
            >
              Equipo Actual
            </h3>
            <span
              style="
                background: #e0e7ff;
                color: #4338ca;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                border: 1px solid #c7d2fe;
              "
            >
              {{ equipo.participantes?.length || 0 }} / 5
            </span>
          </div>
          <div style="padding: 1.5rem">
            <div
              v-if="!equipo.participantes || equipo.participantes.length === 0"
              style="
                text-align: center;
                padding: 2rem;
                border: 2px dashed #e5e7eb;
                border-radius: 0.75rem;
              "
            >
              <p style="font-size: 0.875rem; color: #9ca3af; margin: 0">
                Este equipo aún no tiene integrantes.
              </p>
            </div>

            <div
              v-else
              v-for="part in equipo.participantes"
              :key="part.id"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                margin-bottom: 0.75rem;
                background: white;
                border: 1px solid #f3f4f6;
                border-radius: 0.75rem;
                transition: all 0.2s;
              "
              class="hover:shadow-md hover:border-indigo-100 group"
            >
              <div style="display: flex; align-items: center; gap: 1rem">
                <div
                  style="
                    width: 3rem;
                    height: 3rem;
                    border-radius: 9999px;
                    background: linear-gradient(
                      to bottom right,
                      #3b82f6,
                      #4f46e5
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1.125rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                  "
                >
                  {{ part.user?.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem">
                    <h4
                      style="
                        font-size: 0.875rem;
                        font-weight: 700;
                        color: #111827;
                        margin: 0;
                      "
                    >
                      {{ part.user?.name }}
                    </h4>
                    <span
                      v-if="part.equipo_participante?.perfil === 'Líder'"
                      style="
                        font-size: 10px;
                        background: #fef3c7;
                        color: #92400e;
                        padding: 0.125rem 0.5rem;
                        border-radius: 9999px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                      "
                      >Líder</span
                    >
                  </div>
                  <p
                    style="
                      font-size: 0.75rem;
                      color: #6b7280;
                      margin: 0.125rem 0 0;
                    "
                  >
                    {{ part.user?.email }}
                  </p>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      margin-top: 0.25rem;
                    "
                  >
                    <span
                      style="font-size: 10px; font-weight: 700; color: #4f46e5"
                      >{{ part.equipo_participante?.perfil || 'Sin Rol' }}</span
                    >
                  </div>
                </div>
              </div>
              <button
                @click="removeMember(part.user_id)"
                style="
                  padding: 0.5rem;
                  color: #d1d5db;
                  background: none;
                  border: none;
                  cursor: pointer;
                  border-radius: 0.5rem;
                  transition: all 0.2s;
                "
                class="hover:text-red-500 hover:bg-red-50"
                title="Eliminar del equipo"
              >
                <svg
                  style="width: 1.25rem; height: 1.25rem"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Proyecto -->
        <div
          style="
            background: var(--card-bg, #fff);
            border-radius: 1rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border, #e5e7eb);
          "
        >
          <div
            style="
              padding: 1.5rem;
              border-bottom: 1px solid var(--border, #f3f4f6);
              background: #f9fafb;
              border-top-left-radius: 1rem;
              border-top-right-radius: 1rem;
            "
          >
            <h3
              style="
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--text-primary);
              "
            >
              Datos del Proyecto
            </h3>
          </div>
          <div style="padding: 1.5rem">
            <div v-if="equipo.proyecto">
              <h4
                style="
                  font-size: 1.25rem;
                  font-weight: 700;
                  color: #4338ca;
                  margin: 0 0 0.5rem;
                "
              >
                {{ equipo.proyecto.nombre }}
              </h4>
              <p
                style="
                  font-size: 0.875rem;
                  color: #4b5563;
                  line-height: 1.5;
                  margin: 0 0 1rem;
                "
              >
                {{ equipo.proyecto.descripcion }}
              </p>

              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  padding: 0.75rem;
                  background: #f9fafb;
                  border-radius: 0.5rem;
                  border: 1px solid #f3f4f6;
                "
              >
                <div
                  style="
                    padding: 0.5rem;
                    background: white;
                    border-radius: 0.25rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                  "
                >
                  <svg
                    style="width: 1.25rem; height: 1.25rem; color: #a855f7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <span
                    style="
                      display: block;
                      font-size: 10px;
                      font-weight: 700;
                      color: #9ca3af;
                      text-transform: uppercase;
                      letter-spacing: 0.05em;
                    "
                    >Evento Asociado</span
                  >
                  <span
                    style="
                      font-size: 0.875rem;
                      font-weight: 700;
                      color: #1f2937;
                    "
                    >{{
                      equipo.proyecto.eventos?.nombre || "Evento no disponible"
                    }}</span
                  >
                </div>
              </div>
            </div>
            <div v-else style="text-align: center; padding: 2rem">
              <div
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 3rem;
                  height: 3rem;
                  border-radius: 9999px;
                  background: #fef3c7;
                  color: #d97706;
                  margin-bottom: 0.75rem;
                "
              >
                <svg
                  style="width: 1.5rem; height: 1.5rem"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h4
                style="
                  font-size: 1rem;
                  font-weight: 700;
                  color: #111827;
                  margin: 0;
                "
              >
                Sin Proyecto Registrado
              </h4>
              <p
                style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0"
              >
                El líder del equipo debe registrar el proyecto desde su panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import AppLayout from "../../components/layout/AppLayout.vue";
import api from "../../services/api";

const route = useRoute();
const loading = ref(true);
const equipo = ref({});
const perfiles = ref([]);
const allUsers = ref([]);
const saving = ref(false);

const search = ref("");
const selectedCandidate = ref(null);
const selectedPerfil = ref("");

const filteredCandidates = computed(() => {
  if (!search.value) return [];
  const query = search.value.toLowerCase();
  return allUsers.value.filter(
    (u) =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query),
  );
});

onMounted(async () => {
  fetchData();

  try {
    const profs = await api.get("/admin/perfiles");
    perfiles.value = profs.data.data;
  } catch (e) {}

  try {
    const users = await api.get("/admin/usuarios", { params: { limit: 1000 } });
    // Only simple un-assigned filtering... Note: The Laravel view was much more complex, but here we'll filter out users already in equipo.
    allUsers.value = users.data.data.usuarios || [];
  } catch (e) {}
});

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await api.get(`/admin/equipos/${route.params.id}`);
    equipo.value = data.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function addMember() {
  if (!selectedCandidate.value || !selectedPerfil.value) return;
  saving.value = true;
  try {
    await api.post(`/admin/equipos/${route.params.id}/miembros`, {
      participante_id: selectedCandidate.value.id,
      perfil_id: parseInt(selectedPerfil.value),
    });

    selectedCandidate.value = null;
    selectedPerfil.value = "";
    search.value = "";
    fetchData();
  } catch (e) {
    alert(e.response?.data?.message || "Error al asignar miembro");
  } finally {
    saving.value = false;
  }
}

async function removeMember(participante_id) {
  if (!confirm("¿Estás seguro de expulsar a este miembro?")) return;
  try {
    await api.delete(
      `/admin/equipos/${route.params.id}/miembros/${participante_id}`,
    );
    fetchData();
  } catch (e) {
    alert(e.response?.data?.message || "Error al expulsar");
  }
}
</script>

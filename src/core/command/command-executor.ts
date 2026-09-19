import { useDashboardStore } from "@/stores/dashboard-store";
import type { CommandExecutionResult, ParsedCommand } from "@/types/command";

export function executeParsedCommand(command: ParsedCommand): CommandExecutionResult {
  const dashboardStore = useDashboardStore.getState();
  const currentDashboard = dashboardStore.dashboard;

  switch (command.intent) {
    case "change_chart_type": {
      if (!currentDashboard || currentDashboard.mainCharts.length === 0) {
        return {
          success: false,
          message: "Tidak ada chart aktif di dasbor saat ini.",
          executedCommand: command,
        };
      }
      if (!command.targetChartType) {
        return {
          success: false,
          message: "Tipe visualisasi target tidak dikenali.",
          executedCommand: command,
        };
      }

      // Change the first/primary main chart type
      const primaryChart = currentDashboard.mainCharts[0];
      dashboardStore.changeChartType(primaryChart.id, command.targetChartType);

      return {
        success: true,
        message: `Visualisasi "${primaryChart.title}" berhasil diubah menjadi ${command.targetChartType.toUpperCase()}.`,
        executedCommand: command,
      };
    }

    case "switch_template": {
      if (!command.targetTemplateId) {
        return {
          success: false,
          message: "Template target tidak ditentukan.",
          executedCommand: command,
        };
      }
      dashboardStore.setTemplate(command.targetTemplateId);
      return {
        success: true,
        message: `Tema dasbor berhasil beralih ke template ${command.targetTemplateId.toUpperCase()}.`,
        executedCommand: command,
      };
    }

    case "filter_category": {
      if (!command.targetCategory) {
        return {
          success: false,
          message: "Kategori filter tidak terdefinisi.",
          executedCommand: command,
        };
      }
      dashboardStore.setGlobalCategoryFilter(command.targetCategory);
      return {
        success: true,
        message: `Filter aktif diterapkan pada kategori "${command.targetCategory}".`,
        executedCommand: command,
      };
    }

    case "search_query": {
      if (!command.searchQuery) {
        return {
          success: false,
          message: "Kata kunci pencarian kosong.",
          executedCommand: command,
        };
      }
      dashboardStore.setSearchFilter(command.searchQuery);
      return {
        success: true,
        message: `Menerapkan filter pencarian untuk "${command.searchQuery}".`,
        executedCommand: command,
      };
    }

    case "clear_filters": {
      dashboardStore.setGlobalCategoryFilter(null);
      dashboardStore.setSearchFilter("");
      return {
        success: true,
        message: "Semua filter kategori dan kueri pencarian berhasil dibersihkan.",
        executedCommand: command,
      };
    }

    case "toggle_edit_layout": {
      dashboardStore.toggleEditLayout();
      const isNowEditing = useDashboardStore.getState().isEditingLayout;
      return {
        success: true,
        message: isNowEditing
          ? "Mode penyesuaian susunan visual diaktifkan."
          : "Mode penyesuaian susunan visual dinonaktifkan.",
        executedCommand: command,
      };
    }

    case "sort_data": {
      if (!currentDashboard || currentDashboard.mainCharts.length === 0) {
        return {
          success: false,
          message: "Tidak ada chart aktif untuk diurutkan.",
          executedCommand: command,
        };
      }

      // Sort data in main charts
      const dir = command.sortDirection || "desc";
      const updatedCharts = currentDashboard.mainCharts.map((ch) => {
        const sortedData = [...ch.data].sort((a, b) =>
          dir === "desc" ? b.value - a.value : a.value - b.value
        );
        return { ...ch, data: sortedData };
      });

      useDashboardStore.setState({
        dashboard: {
          ...currentDashboard,
          mainCharts: updatedCharts,
        },
      });

      return {
        success: true,
        message: `Data visualisasi berhasil diurutkan secara ${dir === "desc" ? "Tertinggi (Descending)" : "Terendah (Ascending)"}.`,
        executedCommand: command,
      };
    }

    case "export_png": {
      return {
        success: true,
        message: "Permintaan ekspor visualisasi diterima. Membuka opsi pengunduhan.",
        executedCommand: command,
      };
    }

    default:
      return {
        success: false,
        message: `Perintah "${command.rawInput}" belum didukung. Coba ketik "ubah ke bar chart" atau "reset filter".`,
        executedCommand: command,
      };
  }
}

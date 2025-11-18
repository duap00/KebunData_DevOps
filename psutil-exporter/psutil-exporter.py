#!/usr/bin/env python3
import psutil
import time
from prometheus_client import start_http_server, Gauge, Info
import platform

# System Information
system_info = Info('system', 'System information')

# CPU Metrics
cpu_percent = Gauge('psutil_cpu_percent', 'CPU usage percentage')
cpu_percent_per_core = Gauge('psutil_cpu_percent_per_core', 'CPU per core', ['core'])
cpu_freq_current = Gauge('psutil_cpu_frequency_current_mhz', 'Current CPU frequency')
cpu_freq_min = Gauge('psutil_cpu_frequency_min_mhz', 'Minimum CPU frequency')
cpu_freq_max = Gauge('psutil_cpu_frequency_max_mhz', 'Maximum CPU frequency')
cpu_count_logical = Gauge('psutil_cpu_count_logical', 'Logical CPU count')
cpu_count_physical = Gauge('psutil_cpu_count_physical', 'Physical CPU count')

# CPU Stats
cpu_ctx_switches = Gauge('psutil_cpu_ctx_switches_total', 'Context switches')
cpu_interrupts = Gauge('psutil_cpu_interrupts_total', 'Interrupts')
cpu_soft_interrupts = Gauge('psutil_cpu_soft_interrupts_total', 'Software interrupts')
cpu_syscalls = Gauge('psutil_cpu_syscalls_total', 'System calls')

# Memory Metrics
memory_total = Gauge('psutil_memory_total_bytes', 'Total memory')
memory_available = Gauge('psutil_memory_available_bytes', 'Available memory')
memory_used = Gauge('psutil_memory_used_bytes', 'Used memory')
memory_free = Gauge('psutil_memory_free_bytes', 'Free memory')
memory_percent = Gauge('psutil_memory_percent', 'Memory usage percentage')
memory_active = Gauge('psutil_memory_active_bytes', 'Active memory')
memory_inactive = Gauge('psutil_memory_inactive_bytes', 'Inactive memory')
memory_buffers = Gauge('psutil_memory_buffers_bytes', 'Buffer memory')
memory_cached = Gauge('psutil_memory_cached_bytes', 'Cached memory')
memory_shared = Gauge('psutil_memory_shared_bytes', 'Shared memory')

# Swap Memory
swap_total = Gauge('psutil_swap_total_bytes', 'Total swap')
swap_used = Gauge('psutil_swap_used_bytes', 'Used swap')
swap_free = Gauge('psutil_swap_free_bytes', 'Free swap')
swap_percent = Gauge('psutil_swap_percent', 'Swap usage percentage')
swap_sin = Gauge('psutil_swap_sin_bytes', 'Swap in')
swap_sout = Gauge('psutil_swap_sout_bytes', 'Swap out')

# Disk Metrics
disk_usage_percent = Gauge('psutil_disk_usage_percent', 'Disk usage', ['mountpoint', 'device', 'fstype'])
disk_usage_total = Gauge('psutil_disk_usage_total_bytes', 'Total disk', ['mountpoint', 'device', 'fstype'])
disk_usage_used = Gauge('psutil_disk_usage_used_bytes', 'Used disk', ['mountpoint', 'device', 'fstype'])
disk_usage_free = Gauge('psutil_disk_usage_free_bytes', 'Free disk', ['mountpoint', 'device', 'fstype'])

# Disk I/O
disk_io_read_count = Gauge('psutil_disk_io_read_count_total', 'Disk read count', ['device'])
disk_io_write_count = Gauge('psutil_disk_io_write_count_total', 'Disk write count', ['device'])
disk_io_read_bytes = Gauge('psutil_disk_io_read_bytes_total', 'Disk read bytes', ['device'])
disk_io_write_bytes = Gauge('psutil_disk_io_write_bytes_total', 'Disk write bytes', ['device'])

# Network Metrics
net_io_sent = Gauge('psutil_net_io_bytes_sent_total', 'Network sent', ['interface'])
net_io_recv = Gauge('psutil_net_io_bytes_recv_total', 'Network received', ['interface'])
net_io_packets_sent = Gauge('psutil_net_io_packets_sent_total', 'Packets sent', ['interface'])
net_io_packets_recv = Gauge('psutil_net_io_packets_recv_total', 'Packets received', ['interface'])
net_io_errin = Gauge('psutil_net_io_errin_total', 'Network errors in', ['interface'])
net_io_errout = Gauge('psutil_net_io_errout_total', 'Network errors out', ['interface'])
net_io_dropin = Gauge('psutil_net_io_dropin_total', 'Dropped packets in', ['interface'])
net_io_dropout = Gauge('psutil_net_io_dropout_total', 'Dropped packets out', ['interface'])

# Process Metrics
process_count = Gauge('psutil_process_count', 'Total processes')
process_running = Gauge('psutil_process_running', 'Running processes')
process_sleeping = Gauge('psutil_process_sleeping', 'Sleeping processes')
process_zombie = Gauge('psutil_process_zombie', 'Zombie processes')

# System Load
load_avg_1min = Gauge('psutil_load_average_1min', '1 minute load average')
load_avg_5min = Gauge('psutil_load_average_5min', '5 minute load average')
load_avg_15min = Gauge('psutil_load_average_15min', '15 minute load average')

# Boot Time
boot_time = Gauge('psutil_boot_time_seconds', 'System boot time')

# Uptime
uptime_seconds = Gauge('psutil_uptime_seconds', 'System uptime')

def collect_metrics():
    """Collect system metrics using psutil"""
    
    # Set system info once
    system_info.info({
        'hostname': platform.node(),
        'platform': platform.system(),
        'platform_release': platform.release(),
        'platform_version': platform.version(),
        'architecture': platform.machine(),
        'processor': platform.processor(),
        'python_version': platform.python_version()
    })
    
    print("Starting metric collection...")
    print(f"System: {platform.system()} {platform.release()}")
    print(f"Hostname: {platform.node()}")
    print(f"Collecting metrics every 5 seconds...\n")
    
    while True:
        try:
            # CPU Metrics
            cpu_percent.set(psutil.cpu_percent(interval=1))
            
            # Per-core CPU
            for idx, percent in enumerate(psutil.cpu_percent(percpu=True, interval=0.1)):
                cpu_percent_per_core.labels(core=f'cpu{idx}').set(percent)
            
            # CPU Frequency
            cpu_freq = psutil.cpu_freq()
            if cpu_freq:
                cpu_freq_current.set(cpu_freq.current)
                cpu_freq_min.set(cpu_freq.min)
                cpu_freq_max.set(cpu_freq.max)
            
            # CPU Count
            cpu_count_logical.set(psutil.cpu_count(logical=True))
            cpu_count_physical.set(psutil.cpu_count(logical=False))
            
            # CPU Stats
            cpu_stats = psutil.cpu_stats()
            cpu_ctx_switches.set(cpu_stats.ctx_switches)
            cpu_interrupts.set(cpu_stats.interrupts)
            cpu_soft_interrupts.set(cpu_stats.soft_interrupts)
            if hasattr(cpu_stats, 'syscalls'):
                cpu_syscalls.set(cpu_stats.syscalls)
            
            # Memory
            mem = psutil.virtual_memory()
            memory_total.set(mem.total)
            memory_available.set(mem.available)
            memory_used.set(mem.used)
            memory_free.set(mem.free)
            memory_percent.set(mem.percent)
            
            if hasattr(mem, 'active'):
                memory_active.set(mem.active)
            if hasattr(mem, 'inactive'):
                memory_inactive.set(mem.inactive)
            if hasattr(mem, 'buffers'):
                memory_buffers.set(mem.buffers)
            if hasattr(mem, 'cached'):
                memory_cached.set(mem.cached)
            if hasattr(mem, 'shared'):
                memory_shared.set(mem.shared)
            
            # Swap
            swap = psutil.swap_memory()
            swap_total.set(swap.total)
            swap_used.set(swap.used)
            swap_free.set(swap.free)
            swap_percent.set(swap.percent)
            swap_sin.set(swap.sin)
            swap_sout.set(swap.sout)
            
            # Disk Usage
            for partition in psutil.disk_partitions():
                if partition.fstype:  # Skip if no filesystem
                    try:
                        usage = psutil.disk_usage(partition.mountpoint)
                        disk_usage_percent.labels(
                            mountpoint=partition.mountpoint,
                            device=partition.device,
                            fstype=partition.fstype
                        ).set(usage.percent)
                        disk_usage_total.labels(
                            mountpoint=partition.mountpoint,
                            device=partition.device,
                            fstype=partition.fstype
                        ).set(usage.total)
                        disk_usage_used.labels(
                            mountpoint=partition.mountpoint,
                            device=partition.device,
                            fstype=partition.fstype
                        ).set(usage.used)
                        disk_usage_free.labels(
                            mountpoint=partition.mountpoint,
                            device=partition.device,
                            fstype=partition.fstype
                        ).set(usage.free)
                    except PermissionError:
                        pass
            
            # Disk I/O
            disk_io = psutil.disk_io_counters(perdisk=True)
            if disk_io:
                for device, counters in disk_io.items():
                    disk_io_read_count.labels(device=device).set(counters.read_count)
                    disk_io_write_count.labels(device=device).set(counters.write_count)
                    disk_io_read_bytes.labels(device=device).set(counters.read_bytes)
                    disk_io_write_bytes.labels(device=device).set(counters.write_bytes)
            
            # Network I/O
            net_io = psutil.net_io_counters(pernic=True)
            for interface, counters in net_io.items():
                net_io_sent.labels(interface=interface).set(counters.bytes_sent)
                net_io_recv.labels(interface=interface).set(counters.bytes_recv)
                net_io_packets_sent.labels(interface=interface).set(counters.packets_sent)
                net_io_packets_recv.labels(interface=interface).set(counters.packets_recv)
                net_io_errin.labels(interface=interface).set(counters.errin)
                net_io_errout.labels(interface=interface).set(counters.errout)
                net_io_dropin.labels(interface=interface).set(counters.dropin)
                net_io_dropout.labels(interface=interface).set(counters.dropout)
            
            # Process Count
            process_count.set(len(psutil.pids()))
            
            # Process Status
            status_count = {'running': 0, 'sleeping': 0, 'zombie': 0}
            for proc in psutil.process_iter(['status']):
                try:
                    status = proc.info['status']
                    if status in status_count:
                        status_count[status] += 1
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            process_running.set(status_count.get('running', 0))
            process_sleeping.set(status_count.get('sleeping', 0))
            process_zombie.set(status_count.get('zombie', 0))
            
            # System Load
            load_avg = psutil.getloadavg()
            load_avg_1min.set(load_avg[0])
            load_avg_5min.set(load_avg[1])
            load_avg_15min.set(load_avg[2])
            
            # Boot Time
            boot_time.set(psutil.boot_time())
            
            # Uptime
            uptime_seconds.set(time.time() - psutil.boot_time())
            
            time.sleep(5)
            
        except Exception as e:
            print(f"Error collecting metrics: {e}")
            time.sleep(5)

if __name__ == '__main__':
    print("=" * 60)
    print("psutil Prometheus Exporter for Robot People")
    print("=" * 60)
    start_http_server(9101)
    print("✅ Exporter started on port 9101")
    print("📊 Metrics available at: http://localhost:9101/metrics")
    print("=" * 60)
    collect_metrics()

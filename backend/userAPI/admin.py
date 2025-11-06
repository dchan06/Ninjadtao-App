from django.contrib import admin
from .models import Classes, userModel

admin.site.register(userModel)
admin.site.register(Classes)

